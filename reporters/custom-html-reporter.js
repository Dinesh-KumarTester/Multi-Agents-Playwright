import fs from 'node:fs/promises';
import path from 'node:path';

const escapeInlineJson = (value) => JSON.stringify(value)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

const redactInputValues = (value) => value.replace(/\b(Fill|Type|Press sequentially)\s+"(?:\\.|[^"\\])*"/gi, '$1 "[redacted]"');

const toRelativeUrl = (filePath, fromDirectory) => path.relative(fromDirectory, filePath)
  .split(path.sep)
  .map(encodeURIComponent)
  .join('/');

const serializeAttachment = (attachment, fromDirectory) => attachment.path
  ? {
      name: attachment.name,
      contentType: attachment.contentType,
      url: toRelativeUrl(attachment.path, fromDirectory)
    }
  : null;

const serializeStep = (step, fromDirectory) => ({
  title: redactInputValues(step.title),
  category: step.category,
  duration: step.duration,
  error: step.error
    ? {
        message: redactInputValues(step.error.message ?? 'Step failed.'),
        stack: redactInputValues(step.error.stack ?? '')
      }
    : null,
  attachments: (step.attachments ?? [])
    .map((attachment) => serializeAttachment(attachment, fromDirectory))
    .filter(Boolean),
  steps: step.steps.map((child) => serializeStep(child, fromDirectory))
});

class CustomHtmlReporter {
  constructor(options = {}) {
    this.outputFile = path.resolve(process.cwd(), options.outputFile ?? 'custom-report/index.html');
    this.tests = new Map();
  }

  onBegin() {
    this.startedAt = new Date();
  }

  onTestEnd(test, result) {
    const previous = this.tests.get(test.id);
    const project = test.parent.project()?.name;
    const outcome = test.outcome();
    const status = outcome === 'flaky'
      ? 'flaky'
      : result.status === 'passed'
        ? 'passed'
        : result.status === 'skipped'
          ? 'skipped'
          : 'failed';

    const attempt = {
      status: result.status === 'passed'
        ? 'passed'
        : result.status === 'skipped'
          ? 'skipped'
          : 'failed',
      duration: result.duration,
      retry: result.retry,
      errors: result.errors.map((error) => ({
        message: redactInputValues(error.message ?? 'Test failed without an error message.'),
        stack: redactInputValues(error.stack ?? '')
      })),
      steps: result.steps.map((step) => serializeStep(step, path.dirname(this.outputFile))),
      attachments: result.attachments
        .map((attachment) => serializeAttachment(attachment, path.dirname(this.outputFile)))
        .filter(Boolean)
    };

    this.tests.set(test.id, {
      title: test.title,
      titlePath: test.titlePath().slice(0, -1).filter((part) => part !== project && part !== path.basename(test.location.file)),
      project: project ?? 'Default',
      file: path.relative(process.cwd(), test.location.file).split(path.sep).join('/'),
      line: test.location.line,
      status,
      duration: result.duration,
      retries: result.retry,
      attempts: [...(previous?.attempts ?? []), attempt]
    });
  }

  async onEnd(result) {
    const tests = [...this.tests.values()];
    const summary = {
      total: tests.length,
      passed: tests.filter((test) => test.status === 'passed' || test.status === 'flaky').length,
      failed: tests.filter((test) => test.status === 'failed').length,
      skipped: tests.filter((test) => test.status === 'skipped').length,
      flaky: tests.filter((test) => test.status === 'flaky').length
    };
    const report = {
      generatedAt: new Date().toISOString(),
      startedAt: this.startedAt?.toISOString() ?? new Date().toISOString(),
      duration: this.startedAt ? Date.now() - this.startedAt.getTime() : 0,
      runStatus: result.status,
      projects: [...new Set(tests.map((test) => test.project))],
      summary,
      tests
    };

    await fs.mkdir(path.dirname(this.outputFile), { recursive: true });
    await fs.writeFile(this.outputFile, this.render(report), 'utf8');
    console.log(`\nCustom HTML report: ${this.outputFile}`);
  }

  render(report) {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='12' fill='%230d1b28'/%3E%3Cpath d='M20 6 23.8 16.2 34 20l-10.2 3.8L20 34l-3.8-10.2L6 20l10.2-3.8z' fill='%2372f0d2'/%3E%3C/svg%3E">
  <title>Playwright execution report</title>
  <style>
    :root {
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #080d18;
      color: #eef2ff;
      font-synthesis: none;
      --muted: #9aa8c2;
      --line: rgba(165, 181, 211, .13);
      --panel: rgba(17, 26, 44, .82);
      --green: #67e8b3;
      --red: #ff8296;
      --amber: #ffce75;
      --blue: #8caaff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(ellipse at 82% -8%, rgba(87, 107, 255, .22), transparent 38rem),
        radial-gradient(ellipse at 4% 18%, rgba(49, 214, 188, .12), transparent 34rem),
        #080d18;
    }
    button, input, select { font: inherit; }
    .shell { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 38px 0 64px; }
    .topbar, .brand, .run-meta, .section-heading, .toolbar, .test-heading, .test-meta, .attachment-list {
      display: flex; align-items: center;
    }
    .topbar { justify-content: space-between; gap: 20px; margin-bottom: 48px; }
    .brand { gap: 12px; color: #dce5f8; font-size: 13px; font-weight: 750; letter-spacing: .13em; text-transform: uppercase; }
    .brand-mark {
      display: grid; width: 36px; height: 36px; place-items: center; border: 1px solid rgba(115, 239, 209, .35);
      border-radius: 12px; color: #72f0d2; background: rgba(65, 216, 188, .1); box-shadow: 0 0 28px rgba(65, 216, 188, .13);
    }
    .run-meta { gap: 10px; color: var(--muted); font-size: 12px; }
    .live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 12px var(--green); }
    .intro { margin-bottom: 28px; }
    .eyebrow { color: #81decf; font-size: 11px; font-weight: 750; letter-spacing: .17em; text-transform: uppercase; }
    h1 { margin: 12px 0 8px; font-size: clamp(30px, 5vw, 46px); line-height: 1.08; letter-spacing: -.045em; }
    .subtitle { margin: 0; color: var(--muted); font-size: 14px; }
    .overview {
      display: grid; grid-template-columns: minmax(0, 1.3fr) repeat(4, minmax(110px, .7fr)); gap: 12px; margin: 26px 0 38px;
    }
    .panel, .metric-card, .test-card {
      border: 1px solid var(--line); background: var(--panel); backdrop-filter: blur(16px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, .13);
    }
    .quality-card {
      display: flex; align-items: center; justify-content: space-between; gap: 18px; min-height: 170px; padding: 24px;
      border-radius: 20px; background: linear-gradient(135deg, rgba(28, 49, 70, .92), rgba(20, 27, 49, .86));
    }
    .quality-copy h2 { margin: 0 0 8px; font-size: 16px; }
    .quality-copy p { margin: 0; max-width: 290px; color: var(--muted); font-size: 12px; line-height: 1.65; }
    .quality-label { margin-bottom: 8px; color: #9eacc5; font-size: 10px; font-weight: 750; letter-spacing: .13em; text-transform: uppercase; }
    .gauge {
      --pass-angle: 0deg;
      display: grid; flex: 0 0 auto; width: 112px; height: 112px; place-items: center; border-radius: 50%;
      background: conic-gradient(var(--green) var(--pass-angle), rgba(159, 177, 205, .12) var(--pass-angle));
      position: relative;
    }
    .gauge::before { content: ""; position: absolute; inset: 7px; border-radius: 50%; background: #111a2b; }
    .gauge-value { position: relative; text-align: center; font-size: 24px; font-weight: 780; letter-spacing: -.04em; }
    .gauge-value small { display: block; margin-top: 2px; color: var(--muted); font-size: 9px; font-weight: 650; letter-spacing: .12em; text-transform: uppercase; }
    .metric-card { display: flex; min-height: 170px; flex-direction: column; justify-content: space-between; padding: 20px 17px; border-radius: 18px; }
    .metric-top { display: flex; align-items: center; justify-content: space-between; color: var(--muted); font-size: 11px; font-weight: 650; }
    .metric-icon { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 9px; background: rgba(146, 167, 206, .1); color: #bac8e2; font-size: 13px; }
    .metric-value { font-size: 30px; font-weight: 760; letter-spacing: -.055em; }
    .metric-note { color: #8392ad; font-size: 10px; }
    .metric-card.passed .metric-icon { color: var(--green); background: rgba(103, 232, 179, .1); }
    .metric-card.failed .metric-icon { color: var(--red); background: rgba(255, 130, 150, .1); }
    .metric-card.skipped .metric-icon { color: var(--amber); background: rgba(255, 206, 117, .1); }
    .section-heading { justify-content: space-between; gap: 20px; margin: 0 0 16px; }
    .section-heading h2 { margin: 0; font-size: 17px; letter-spacing: -.02em; }
    .result-count { color: var(--muted); font-size: 11px; }
    .toolbar { gap: 10px; margin-bottom: 14px; }
    .search-wrap { position: relative; flex: 1; }
    .search-icon { position: absolute; top: 50%; left: 13px; color: #8392ad; transform: translateY(-50%); pointer-events: none; }
    .search, .filter {
      min-height: 42px; border: 1px solid var(--line); border-radius: 11px; outline: none; color: #e8efff; background: rgba(17, 26, 44, .82);
    }
    .search { width: 100%; padding: 0 14px 0 38px; }
    .filter { min-width: 142px; padding: 0 30px 0 12px; }
    .search:focus, .filter:focus { border-color: rgba(115, 239, 209, .6); box-shadow: 0 0 0 3px rgba(65, 216, 188, .1); }
    .test-list { display: grid; gap: 9px; }
    .test-card { overflow: hidden; border-radius: 14px; }
    .test-heading { justify-content: space-between; gap: 16px; padding: 17px 18px; }
    .test-title-group { display: flex; min-width: 0; align-items: flex-start; gap: 12px; }
    .status-icon { display: grid; width: 26px; height: 26px; flex: 0 0 auto; place-items: center; margin-top: 1px; border-radius: 9px; font-size: 12px; }
    .status-icon.passed { color: var(--green); background: rgba(103, 232, 179, .1); }
    .status-icon.failed { color: var(--red); background: rgba(255, 130, 150, .1); }
    .status-icon.skipped { color: var(--amber); background: rgba(255, 206, 117, .1); }
    .status-icon.flaky { color: var(--blue); background: rgba(140, 170, 255, .12); }
    .test-title { overflow-wrap: anywhere; font-size: 13px; font-weight: 680; line-height: 1.45; }
    .test-path { margin-top: 5px; overflow-wrap: anywhere; color: #8492ac; font-size: 10px; }
    .test-meta { justify-content: flex-end; gap: 9px; flex: 0 0 auto; }
    .status-pill { padding: 5px 9px; border-radius: 99px; font-size: 9px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
    .status-pill.passed { color: var(--green); background: rgba(103, 232, 179, .1); }
    .status-pill.failed { color: var(--red); background: rgba(255, 130, 150, .1); }
    .status-pill.skipped { color: var(--amber); background: rgba(255, 206, 117, .1); }
    .status-pill.flaky { color: var(--blue); background: rgba(140, 170, 255, .12); }
    .duration { color: #a4b1c8; font-size: 10px; white-space: nowrap; }
    details:not(.test-card) { border-top: 1px solid var(--line); }
    details:not(.test-card) summary { padding: 11px 18px; color: #aab8d0; cursor: pointer; font-size: 10px; }
    details.test-card > summary { list-style: none; cursor: pointer; }
    details.test-card > summary::-webkit-details-marker { display: none; }
    .expand-icon { color: #8492ac; font-size: 15px; transition: transform .18s ease; }
    details.test-card[open] .expand-icon { transform: rotate(180deg); }
    .details-content { padding: 0 18px 16px; }
    .error-block { margin: 0; padding: 13px; overflow-x: auto; border: 1px solid rgba(255, 130, 150, .14); border-radius: 10px; background: rgba(5, 9, 17, .55); color: #ffb6c1; font: 11px/1.6 ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
    .attachment-list { flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .attachment { padding: 7px 10px; border: 1px solid var(--line); border-radius: 8px; color: #b7c8ec; text-decoration: none; font-size: 10px; }
    .attachment:hover { border-color: rgba(115, 239, 209, .5); color: #8ef3dc; }
    .attempts { display: grid; gap: 14px; }
    .attempt-block { padding: 14px; border: 1px solid var(--line); border-radius: 11px; background: rgba(5, 9, 17, .24); }
    .attempt-heading, .step-row { display: flex; align-items: center; gap: 9px; }
    .attempt-heading { margin-bottom: 12px; color: #d7e1f4; font-size: 11px; font-weight: 720; }
    .attempt-heading .status-pill { margin-left: auto; }
    .details-label { margin: 12px 0 8px; color: #a7b5ce; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
    .steps { display: grid; gap: 7px; margin: 0; padding: 0; list-style: none; }
    .step-row { min-height: 32px; padding: 6px 9px; border: 1px solid rgba(165, 181, 211, .08); border-radius: 8px; background: rgba(17, 26, 44, .54); }
    .step-check { display: grid; width: 18px; height: 18px; flex: 0 0 auto; place-items: center; border-radius: 6px; color: var(--green); background: rgba(103, 232, 179, .1); font-size: 10px; }
    .step-item.failed > .step-row .step-check { color: var(--red); background: rgba(255, 130, 150, .1); }
    .step-copy { display: flex; min-width: 0; flex: 1; align-items: baseline; justify-content: space-between; gap: 10px; }
    .step-title { overflow-wrap: anywhere; color: #d5def0; font-size: 10px; line-height: 1.5; }
    .step-category, .step-duration { color: #8290a9; font-size: 9px; }
    .step-duration { white-space: nowrap; }
    .step-children { display: grid; gap: 6px; margin: 6px 0 0 13px; padding-left: 12px; border-left: 1px solid rgba(165, 181, 211, .15); list-style: none; }
    .step-error { margin: 6px 0 0 27px; padding: 9px; border: 1px solid rgba(255, 130, 150, .12); border-radius: 8px; background: rgba(5, 9, 17, .48); color: #ffb6c1; font: 10px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
    .screenshot-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 9px; }
    .screenshot-link { display: block; width: min(320px, 100%); overflow: hidden; border: 1px solid var(--line); border-radius: 9px; background: #080d18; color: #b7c8ec; text-decoration: none; }
    .screenshot-link img { display: block; width: 100%; max-height: 220px; object-fit: contain; }
    .screenshot-caption { display: block; padding: 7px 9px; font-size: 10px; }
    .empty-state { padding: 34px 20px; border: 1px dashed var(--line); border-radius: 14px; color: var(--muted); text-align: center; font-size: 12px; }
    footer { display: flex; justify-content: space-between; gap: 16px; margin-top: 22px; color: #74829b; font-size: 10px; }
    @media (max-width: 900px) {
      .overview { grid-template-columns: repeat(4, 1fr); }
      .quality-card { grid-column: 1 / -1; min-height: 145px; }
      .metric-card { min-height: 130px; }
    }
    @media (max-width: 560px) {
      .shell { width: min(100% - 24px, 1180px); padding-top: 22px; }
      .topbar { margin-bottom: 34px; }
      .run-meta { max-width: 48%; justify-content: flex-end; text-align: right; }
      .overview { grid-template-columns: repeat(2, 1fr); gap: 9px; }
      .quality-card { min-height: 136px; padding: 18px; }
      .gauge { width: 88px; height: 88px; }
      .gauge-value { font-size: 19px; }
      .metric-card { min-height: 115px; padding: 15px; }
      .metric-value { font-size: 25px; }
      .section-heading { align-items: flex-start; flex-direction: column; gap: 6px; }
      .toolbar { align-items: stretch; flex-direction: column; }
      .filter { width: 100%; }
      .test-heading { align-items: flex-start; flex-direction: column; }
      .test-meta { width: 100%; justify-content: flex-start; padding-left: 38px; }
      footer { flex-direction: column; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header class="topbar">
      <div class="brand"><span class="brand-mark" aria-hidden="true">✦</span><span>Quality pulse</span></div>
      <div class="run-meta"><span class="live-dot" aria-hidden="true"></span><span id="run-status">Report ready</span><span aria-hidden="true">·</span><time id="run-time"></time></div>
    </header>
    <section class="intro" aria-labelledby="page-title">
      <div class="eyebrow">Playwright · execution insights</div>
      <h1 id="page-title">Test execution report</h1>
      <p class="subtitle" id="run-summary"></p>
    </section>
    <section class="overview" aria-label="Execution summary">
      <article class="panel quality-card">
        <div class="quality-copy">
          <div class="quality-label">Overall quality</div>
          <h2 id="quality-title">Run complete</h2>
          <p id="quality-description"></p>
        </div>
        <div class="gauge" id="pass-gauge" role="img" aria-label="Pass rate">
          <div class="gauge-value"><span id="pass-rate">0%</span><small>pass rate</small></div>
        </div>
      </article>
      <article class="metric-card"><div class="metric-top"><span>Total tests</span><span class="metric-icon" aria-hidden="true">◎</span></div><div class="metric-value" id="total-count">0</div><div class="metric-note">Across this execution</div></article>
      <article class="metric-card passed"><div class="metric-top"><span>Passed</span><span class="metric-icon" aria-hidden="true">✓</span></div><div class="metric-value" id="passed-count">0</div><div class="metric-note" id="flaky-note">Including recovered tests</div></article>
      <article class="metric-card failed"><div class="metric-top"><span>Failed</span><span class="metric-icon" aria-hidden="true">×</span></div><div class="metric-value" id="failed-count">0</div><div class="metric-note">Need attention</div></article>
      <article class="metric-card skipped"><div class="metric-top"><span>Skipped</span><span class="metric-icon" aria-hidden="true">Ⅱ</span></div><div class="metric-value" id="skipped-count">0</div><div class="metric-note">Not executed</div></article>
    </section>
    <section aria-labelledby="results-title">
      <div class="section-heading">
        <h2 id="results-title">Test results</h2>
        <span class="result-count" id="visible-count"></span>
      </div>
      <div class="toolbar">
        <label class="search-wrap"><span class="search-icon" aria-hidden="true">⌕</span><input class="search" id="search" type="search" placeholder="Search tests, files, or projects" aria-label="Search test results"></label>
        <select class="filter" id="status-filter" aria-label="Filter by status"><option value="all">All statuses</option><option value="passed">Passed</option><option value="failed">Failed</option><option value="flaky">Flaky</option><option value="skipped">Skipped</option></select>
      </div>
      <div class="test-list" id="test-list" aria-live="polite"></div>
    </section>
    <footer><span id="run-duration"></span><span id="project-list"></span></footer>
  </main>
  <script type="application/json" id="report-data">${escapeInlineJson(report)}</script>
  <script>
    const report = JSON.parse(document.getElementById('report-data').textContent);
    const { summary, tests } = report;
    const percent = summary.total ? Math.round((summary.passed / summary.total) * 100) : 0;
    const statusLabels = { passed: 'Passed', failed: 'Failed', flaky: 'Flaky', skipped: 'Skipped' };
    const iconLabels = { passed: '✓', failed: '×', flaky: '↻', skipped: 'Ⅱ' };
    const formatDuration = (milliseconds) => {
      const seconds = Math.max(0, Math.floor(milliseconds / 1000));
      const minutes = Math.floor(seconds / 60);
      return minutes ? minutes + 'm ' + String(seconds % 60).padStart(2, '0') + 's' : seconds + 's';
    };
    const text = (element, value) => { element.textContent = value; };

    text(document.getElementById('pass-rate'), percent + '%');
    document.getElementById('pass-gauge').style.setProperty('--pass-angle', (percent * 3.6) + 'deg');
    text(document.getElementById('total-count'), summary.total);
    text(document.getElementById('passed-count'), summary.passed);
    text(document.getElementById('failed-count'), summary.failed);
    text(document.getElementById('skipped-count'), summary.skipped);
    text(document.getElementById('flaky-note'), summary.flaky + ' recovered test' + (summary.flaky === 1 ? '' : 's'));
    text(document.getElementById('run-time'), new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(report.generatedAt)));
    text(document.getElementById('run-status'), report.runStatus === 'passed' ? 'Run complete' : 'Run ' + report.runStatus);
    text(document.getElementById('run-summary'), report.startedAt ? 'A clear view of what passed, what needs attention, and how this run performed.' : 'Execution details and results from your latest test run.');
    text(document.getElementById('quality-title'), summary.failed ? 'A few things need attention' : summary.total ? 'Looking good' : 'No tests ran');
    text(document.getElementById('quality-description'), summary.total
      ? summary.passed + ' of ' + summary.total + ' tests passed in ' + formatDuration(report.duration) + '.'
      : 'This run did not contain any tests.');
    text(document.getElementById('run-duration'), 'Run duration · ' + formatDuration(report.duration));
    text(document.getElementById('project-list'), report.projects.length ? 'Projects · ' + report.projects.join(', ') : '');

    const list = document.getElementById('test-list');
    const search = document.getElementById('search');
    const filter = document.getElementById('status-filter');
    const make = (tag, className, value) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (value !== undefined) element.textContent = value;
      return element;
    };
    const render = () => {
      const query = search.value.trim().toLowerCase();
      const selectedStatus = filter.value;
      const visible = tests.filter((test) => {
        const searchable = [test.title, test.file, test.project, ...test.titlePath].join(' ').toLowerCase();
        return (selectedStatus === 'all' || test.status === selectedStatus) && searchable.includes(query);
      });
      list.replaceChildren();
      text(document.getElementById('visible-count'), visible.length + ' of ' + tests.length + ' tests');
      if (!visible.length) {
        list.append(make('div', 'empty-state', tests.length ? 'No tests match your search and filters.' : 'Run your Playwright tests to see results here.'));
        return;
      }

      const renderAttachments = (container, attachments) => {
        if (!attachments.length) return;
        const screenshots = attachments.filter((attachment) => attachment.contentType?.startsWith('image/'));
        const otherAttachments = attachments.filter((attachment) => !attachment.contentType?.startsWith('image/'));
        if (screenshots.length) {
          const gallery = make('div', 'screenshot-grid');
          for (const attachment of screenshots) {
            const link = make('a', 'screenshot-link');
            link.href = attachment.url;
            link.target = '_blank';
            link.rel = 'noopener';
            const image = make('img');
            image.src = attachment.url;
            image.alt = attachment.name || 'Test screenshot';
            link.append(image, make('span', 'screenshot-caption', attachment.name || 'Test screenshot'));
            gallery.append(link);
          }
          container.append(gallery);
        }
        if (otherAttachments.length) {
          const links = make('div', 'attachment-list');
          for (const attachment of otherAttachments) {
            const link = make('a', 'attachment', attachment.name || attachment.contentType || 'Attachment');
            link.href = attachment.url;
            link.target = '_blank';
            link.rel = 'noopener';
            links.append(link);
          }
          container.append(links);
        }
      };

      const renderStep = (step) => {
        const item = make('li', 'step-item' + (step.error ? ' failed' : ''));
        const row = make('div', 'step-row');
        row.append(make('span', 'step-check', step.error ? '×' : '✓'));
        const copy = make('div', 'step-copy');
        copy.append(make('span', 'step-title', step.title));
        if (step.category) copy.append(make('span', 'step-category', step.category));
        row.append(copy);
        if (step.duration >= 0) row.append(make('span', 'step-duration', formatDuration(step.duration)));
        item.append(row);
        if (step.error) {
          item.append(make('pre', 'step-error', [step.error.message, step.error.stack].filter(Boolean).join('\\n\\n')));
        }
        if (step.steps.length) {
          const children = make('ol', 'step-children');
          for (const child of step.steps) children.append(renderStep(child));
          item.append(children);
        }
        return item;
      };

      for (const test of visible) {
        const card = make('details', 'test-card');
        card.open = test.status === 'failed' || test.status === 'flaky';
        const titleGroup = make('div', 'test-title-group');
        titleGroup.append(make('span', 'status-icon ' + test.status, iconLabels[test.status]));
        const titleBlock = make('div');
        titleBlock.append(make('div', 'test-title', test.title));
        titleBlock.append(make('div', 'test-path', [test.project, ...test.titlePath, test.file].filter(Boolean).join(' › ')));
        titleGroup.append(titleBlock);

        const meta = make('div', 'test-meta');
        meta.append(make('span', 'status-pill ' + test.status, statusLabels[test.status] || test.status));
        meta.append(make('span', 'duration', formatDuration(test.duration) + (test.retries ? ' · ' + test.retries + ' retr' + (test.retries === 1 ? 'y' : 'ies') : '')));
        meta.append(make('span', 'expand-icon', '⌄'));
        const heading = make('summary', 'test-heading');
        heading.append(titleGroup, meta);
        card.append(heading);

        const content = make('div', 'details-content');
        const attempts = make('div', 'attempts');
        for (const [index, attempt] of test.attempts.entries()) {
          const attemptBlock = make('section', 'attempt-block');
          const attemptHeading = make('div', 'attempt-heading');
          attemptHeading.append(make('span', '', attempt.retry ? 'Retry ' + (attempt.retry + 1) : 'Attempt 1'));
          attemptHeading.append(make('span', 'status-pill ' + attempt.status, statusLabels[attempt.status] || attempt.status));
          attemptBlock.append(attemptHeading);

          for (const error of attempt.errors) {
            attemptBlock.append(make('pre', 'error-block', [error.message, error.stack].filter(Boolean).join('\\n\\n')));
          }
          if (attempt.steps.length) {
            attemptBlock.append(make('div', 'details-label', 'Execution steps'));
            const steps = make('ol', 'steps');
            for (const step of attempt.steps) steps.append(renderStep(step));
            attemptBlock.append(steps);
          } else {
            attemptBlock.append(make('div', 'empty-state', 'No Playwright steps were recorded for this attempt.'));
          }
          if (attempt.attachments.length) {
            attemptBlock.append(make('div', 'details-label', 'Screenshots & attachments'));
          }
          const stepAttachments = [];
          const collectStepAttachments = (steps) => {
            for (const step of steps) {
              stepAttachments.push(...step.attachments);
              collectStepAttachments(step.steps);
            }
          };
          collectStepAttachments(attempt.steps);
          const attachments = [...new Map(
            [...attempt.attachments, ...stepAttachments].map((attachment) => [attachment.url, attachment])
          ).values()];
          if (attachments.length) {
            if (!attempt.attachments.length) {
              attemptBlock.append(make('div', 'details-label', 'Screenshots & attachments'));
            }
            renderAttachments(attemptBlock, attachments);
          }
          if (index < test.attempts.length - 1) {
            attemptBlock.append(make('div', 'metric-note', 'Earlier attempt'));
          }
          attempts.append(attemptBlock);
        }
        if (attempts.childElementCount) {
          content.append(attempts);
        } else {
          content.append(make('div', 'empty-state', 'No execution details were recorded for this test.'));
        }
        card.append(content);
        list.append(card);
      }
    };

    search.addEventListener('input', render);
    filter.addEventListener('change', render);
    render();
  </script>
</body>
</html>`;
  }
}

export default CustomHtmlReporter;
