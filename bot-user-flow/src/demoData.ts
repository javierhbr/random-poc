import type {
  ConversationFile,
  MiniAppRunsFile,
  RunLogsFile,
  StepLogsFile,
} from "./types";

export const demoConversation: ConversationFile = {
  conversation_id: "conv_4602",
  steps: [
    {
      step_id: "s01",
      ts: "2026-02-17T10:00:00Z",
      user: { text: "Hola, necesito ayuda con una transferencia internacional." },
      bot: { text: "Claro. Te ayudo con eso. ¿Desde qué país envías y a cuál destino?" },
    },
    {
      step_id: "s02",
      ts: "2026-02-17T10:00:06Z",
      user: { text: "De México a España, en EUR." },
      bot: { text: "Entendido. Revisaré validaciones KYC, límites y tipo de cambio." },
    },
    {
      step_id: "s03",
      ts: "2026-02-17T10:00:13Z",
      user: { text: "¿Cuánto tarda normalmente?" },
      bot: { text: "Entre 5 minutos y 2 horas según banco receptor y validación." },
    },
    {
      step_id: "s04",
      ts: "2026-02-17T10:00:18Z",
      user: { text: "Perfecto, quiero enviar 2,500 EUR hoy." },
      bot: { text: "Puedo prepararte la orden. Confirmo condiciones y comisiones finales." },
    },
    {
      step_id: "s05",
      ts: "2026-02-17T10:00:24Z",
      user: { text: "Adelante." },
      bot: { text: "Listo. Orden creada. Te comparto id de operación y seguimiento." },
    },
    {
      step_id: "s06",
      ts: "2026-02-17T10:00:31Z",
      user: { text: "Gracias." },
      bot: { text: "Con gusto. Si quieres, también activo alertas del estado de envío." },
    },
  ],
};

export const demoStepLogs: StepLogsFile = {
  conversation_id: "conv_4602",
  step_logs: [
    {
      step_id: "s01",
      events: [{ level: "info", msg: "route=intent_transfer_help" }, { level: "debug", lang: "es-MX" }],
    },
    {
      step_id: "s02",
      events: [
        { level: "info", msg: "route=intent_transfer_details" },
        { level: "info", region_from: "MX", region_to: "ES", currency: "EUR" },
      ],
    },
    { step_id: "s03", events: [{ level: "info", msg: "route=intent_sla_question" }] },
    { step_id: "s04", events: [{ level: "info", msg: "route=intent_execute_transfer" }] },
    { step_id: "s05", events: [{ level: "info", msg: "route=intent_confirm_transfer" }] },
    { step_id: "s06", events: [{ level: "info", msg: "route=intent_thanks" }] },
  ],
};

export const demoMiniApps: MiniAppRunsFile = {
  conversation_id: "conv_4602",
  mini_app_runs: [
    {
      step_id: "s01",
      runs: [
        { run_id: "r001", name: "intent_classifier", order: 1 },
        { run_id: "r002", name: "customer_context_fetch", order: 2, depends_on: ["r001"] },
        { run_id: "r003", name: "assistant_response_generator", order: 3, depends_on: ["r002"] },
      ],
    },
    {
      step_id: "s02",
      runs: [
        { run_id: "r004", name: "intent_classifier", order: 1 },
        { run_id: "r005", name: "kyc_profile_check", order: 2, depends_on: ["r004"] },
        { run_id: "r006", name: "fx_quote_provider", order: 3, depends_on: ["r004"] },
        { run_id: "r007", name: "policy_guard", order: 4, depends_on: ["r005", "r006"] },
        { run_id: "r008", name: "assistant_response_generator", order: 5, depends_on: ["r007"] },
      ],
    },
    {
      step_id: "s03",
      runs: [
        { run_id: "r009", name: "intent_classifier", order: 1 },
        { run_id: "r010", name: "sla_estimator", order: 2, depends_on: ["r009"] },
        { run_id: "r011", name: "assistant_response_generator", order: 3, depends_on: ["r010"] },
      ],
    },
    {
      step_id: "s04",
      runs: [
        { run_id: "r012", name: "intent_classifier", order: 1 },
        { run_id: "r013", name: "transfer_limits_check", order: 2, depends_on: ["r012"] },
        { run_id: "r014", name: "fee_estimator", order: 3, depends_on: ["r013"] },
        { run_id: "r015", name: "assistant_response_generator", order: 4, depends_on: ["r014"] },
      ],
    },
    {
      step_id: "s05",
      runs: [
        { run_id: "r016", name: "intent_classifier", order: 1 },
        { run_id: "r017", name: "transfer_executor", order: 2, depends_on: ["r016"] },
        { run_id: "r018", name: "receipt_writer", order: 3, depends_on: ["r017"] },
      ],
    },
    {
      step_id: "s06",
      runs: [
        { run_id: "r019", name: "intent_classifier", order: 1 },
        { run_id: "r020", name: "alerts_offer_generator", order: 2, depends_on: ["r019"] },
      ],
    },
  ],
};

export const demoRunLogs: RunLogsFile = {
  run_logs: [
    { run_id: "r001", kvps: { intent: "transfer_help", confidence: 0.97 } },
    { run_id: "r002", kvps: { tier: "gold", locale: "es-MX" }, http: [{ url: "/customer", status: 200, ms: 31 }] },
    { run_id: "r003", kvps: { template: "transfer_intro_v2", tone: "concise" } },
    { run_id: "r004", kvps: { intent: "transfer_details", confidence: 0.95 } },
    { run_id: "r005", kvps: { kyc_status: "verified", risk_score: 0.08 } },
    { run_id: "r006", kvps: { pair: "MXN_EUR", rate: 0.0528 }, http: [{ url: "/fx/quote", status: 200, ms: 48 }] },
    { run_id: "r007", kvps: { allowed: true, guard: "EU_TRANSFER_BASELINE" } },
    { run_id: "r008", kvps: { template: "collect_email_confirmation" } },
    { run_id: "r009", kvps: { intent: "sla_question", confidence: 0.94 } },
    { run_id: "r010", kvps: { min_minutes: 5, max_minutes: 120 } },
    { run_id: "r011", kvps: { answer_style: "transparent" } },
    { run_id: "r012", kvps: { intent: "execute_transfer", confidence: 0.93 } },
    { run_id: "r013", kvps: { daily_limit_eur: 10000, requested: 2500, allowed: true } },
    { run_id: "r014", kvps: { fee_eur: 8.5, provider: "swift_lane_a" } },
    { run_id: "r015", kvps: { template: "confirm_order_before_execute" } },
    { run_id: "r016", kvps: { intent: "confirm_transfer", confidence: 0.96 } },
    { run_id: "r017", kvps: { transfer_id: "tr_9f2e11", status: "accepted" }, http: [{ url: "/transfers", status: 201, ms: 87 }] },
    { run_id: "r018", kvps: { receipt_id: "rc_45321", channel: "inbox" } },
    { run_id: "r019", kvps: { intent: "thanks", confidence: 0.99 } },
    { run_id: "r020", kvps: { offer_alerts: true, channels: ["email", "push"] } },
  ],
};
