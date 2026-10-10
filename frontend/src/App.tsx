import { useState, type FormEvent } from "react";
import CrmPage from "./CrmPage";

type FormValues = {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
};

type LeadResult = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  serviceRequested: string;
  details: string | null;
  assignedAdvisorId: string | null;
  assignedAdvisor?: { name: string } | null;
};

type WorkflowSuccess = {
  data: LeadResult;
  notification: {
    status: "sent" | "skipped";
    reason?: string;
  };
};

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; result: WorkflowSuccess }
  | { status: "slack-failed"; leadId: string }
  | { status: "unknown"; message: string };

const initialValues: FormValues = {
  name: "",
  email: "",
  company: "",
  service: "",
  budget: "",
};

function isWorkflowSuccess(value: unknown): value is WorkflowSuccess {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<WorkflowSuccess>;
  const lead = response.data;

  return Boolean(
    lead &&
      typeof lead.id === "string" &&
      typeof lead.companyName === "string" &&
      typeof lead.contactName === "string" &&
      typeof lead.email === "string" &&
      typeof lead.serviceRequested === "string" &&
      (lead.assignedAdvisorId === null ||
        typeof lead.assignedAdvisorId === "string") &&
      response.notification &&
      (response.notification.status === "sent" ||
        response.notification.status === "skipped"),
  );
}

function LeadFormPage() {
  const [values, setValues] = useState(initialValues);
  const [submission, setSubmission] = useState<SubmissionState>({
    status: "idle",
  });

  const isSubmitting = submission.status === "submitting";

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL?.trim();

    if (!webhookUrl) {
      setSubmission({
        status: "unknown",
        message:
          "El formulario todavía no está conectado. Configura la URL del webhook de LeadFlow.",
      });
      return;
    }

    setSubmission({ status: "submitting" });

    const payload = {
      companyName: values.company.trim(),
      contactName: values.name.trim(),
      email: values.email.trim(),
      serviceRequested: values.service,
      details: `Presupuesto estimado: ${values.budget.trim()}`,
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body: unknown = await response.json().catch(() => null);

      if (
        response.status === 502 &&
        body &&
        typeof body === "object" &&
        "error" in body &&
        body.error === "slack_delivery_unconfirmed" &&
        "leadId" in body &&
        typeof body.leadId === "string"
      ) {
        setSubmission({ status: "slack-failed", leadId: body.leadId });
        return;
      }

      if (!response.ok) {
        setSubmission({
          status: "unknown",
          message:
            response.status === 502
              ? "No pudimos confirmar el resultado del procesamiento. Revisa el estado antes de volver a enviar para evitar duplicar el lead."
              : "No se pudo completar el envío. Revisa los datos e inténtalo nuevamente.",
        });
        return;
      }

      if (!isWorkflowSuccess(body)) {
        setSubmission({
          status: "unknown",
          message:
            "La respuesta del flujo no coincide con el resultado esperado. No vuelvas a enviarlo hasta verificar si el lead ya fue registrado.",
        });
        return;
      }

      setSubmission({ status: "success", result: body });
      setValues(initialValues);
    } catch {
      setSubmission({
        status: "unknown",
        message:
          "No pudimos conectar con el flujo. El resultado puede no estar confirmado; verifica si el lead fue recibido antes de volver a enviarlo.",
      });
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="LeadFlow inicio">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>leadflow</span>
        </a>
        <nav className="topbar-nav" aria-label="Navegación principal">
          <a href="/" aria-current="page">Nuevo lead</a>
          <a href="/crm">CRM</a>
        </nav>
        <div className="topbar-note">
          <span className="live-dot" />
          Automatización comercial
        </div>
      </header>

      <section className="hero-layout">
        <div className="intro-column">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            CAPTURA DE LEADS
          </div>
          <h1>
            Cada oportunidad,
            <br />
            <span>en buenas manos.</span>
          </h1>
          <p className="intro-copy">
            Cuéntanos qué necesita tu equipo. LeadFlow registra tu consulta y
            conecta tu proyecto con el asesor indicado.
          </p>

          <div className="flow-card" aria-label="Etapas del flujo LeadFlow">
            <div className="flow-card-heading">
              <span>UN FLUJO, CERO TAREAS MANUALES</span>
              <span className="flow-card-number">01 — 03</span>
            </div>
            <div className="flow-steps">
              <FlowStep number="01" label="Recibimos tu consulta" state="done" />
              <span className="flow-connector" />
              <FlowStep number="02" label="Asignamos un asesor" state="active" />
              <span className="flow-connector" />
              <FlowStep number="03" label="Avisamos al equipo" state="next" />
            </div>
          </div>

          <div className="trust-note">
            <span className="shield-icon" aria-hidden="true">✓</span>
            Tus datos se comparten solo con el equipo que puede ayudarte.
          </div>
        </div>

        <section className="form-card" aria-labelledby="form-title">
          <div className="form-card-top">
            <div>
              <p className="form-kicker">EMPECEMOS</p>
              <h2 id="form-title">Cuéntanos sobre tu proyecto</h2>
              <p className="form-subtitle">
                Completa tus datos y nos pondremos en marcha.
              </p>
            </div>
            <span className="form-index">01</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field-grid">
              <label className="field">
                <span>Nombre completo</span>
                <input
                  autoComplete="name"
                  name="name"
                  placeholder="Ej. Alex Rivera"
                  required
                  value={values.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Email de trabajo</span>
                <input
                  autoComplete="email"
                  name="email"
                  placeholder="alex@empresa.com"
                  required
                  type="email"
                  value={values.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Empresa</span>
                <input
                  autoComplete="organization"
                  name="company"
                  placeholder="Nombre de tu empresa"
                  required
                  value={values.company}
                  onChange={(event) => updateField("company", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Servicio que necesitas</span>
                <select
                  name="service"
                  required
                  value={values.service}
                  onChange={(event) => updateField("service", event.target.value)}
                >
                  <option disabled value="">Selecciona un servicio</option>
                  <option value="RRHH">Recursos humanos</option>
                  <option value="Legal">Legal</option>
                  <option value="Automatización">Automatización</option>
                </select>
              </label>
              <label className="field field-full">
                <span>Presupuesto estimado</span>
                <div className="input-prefix">
                  <input
                    inputMode="decimal"
                    min="0"
                    name="budget"
                    placeholder="Ej. 2.500"
                    required
                    type="number"
                    value={values.budget}
                    onChange={(event) => updateField("budget", event.target.value)}
                  />
                  <span className="currency-label">MONTO</span>
                </div>
                <small className="field-hint">En tu moneda</small>
              </label>
            </div>

            <button className="submit-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <span className="button-spinner" aria-hidden="true" />
                  Procesando tu consulta
                </>
              ) : (
                <>
                  Enviar mi consulta
                  <span className="button-arrow" aria-hidden="true">↗</span>
                </>
              )}
            </button>
            <p className="form-footnote">
              Al enviar, tu consulta se registra y se dirige al equipo adecuado.
            </p>
          </form>

          <div className="result-region" aria-live="polite" aria-atomic="true">
            {isSubmitting && (
              <div className="status-panel status-processing" role="status">
                <span className="status-symbol processing-symbol">
                  <span className="button-spinner" aria-hidden="true" />
                </span>
                <div>
                  <strong>Tu consulta está en camino</strong>
                  <p>Registrando el lead y buscando al asesor indicado…</p>
                </div>
              </div>
            )}

            {submission.status === "success" && (
              <div className="status-panel status-success" role="status">
                <span className="status-symbol success-symbol" aria-hidden="true">✓</span>
                <div className="status-content">
                  <strong>
                    {submission.result.notification.status === "sent"
                      ? "Lead recibido y equipo notificado"
                      : "Lead recibido correctamente"}
                  </strong>
                  <p>
                    {submission.result.notification.status === "sent"
                      ? "Tu consulta se registró y la notificación se envió al equipo."
                      : "Tu consulta se registró. Aún no hay un asesor asignado para este servicio."}
                  </p>
                  <div className="result-details">
                    <span>
                      <small>LEAD</small>
                      <b>{submission.result.data.id}</b>
                    </span>
                    <span>
                      <small>ASESOR</small>
                      <b>
                        {submission.result.data.assignedAdvisor?.name ??
                          submission.result.data.assignedAdvisorId ??
                          "Pendiente de asignación"}
                      </b>
                    </span>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setSubmission({ status: "idle" })}
                    type="button"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              </div>
            )}

            {submission.status === "slack-failed" && (
              <div className="status-panel status-warning" role="alert">
                <span className="status-symbol warning-symbol" aria-hidden="true">!</span>
                <div>
                  <strong>Lead recibido; aviso pendiente</strong>
                  <p>
                    El lead quedó registrado (ID {submission.leadId}), pero no
                    pudimos confirmar la notificación. No lo reenvíes para
                    evitar duplicarlo.
                  </p>
                </div>
              </div>
            )}

            {submission.status === "unknown" && (
              <div className="status-panel status-error" role="alert">
                <span className="status-symbol error-symbol" aria-hidden="true">!</span>
                <div>
                  <strong>No pudimos confirmar el resultado</strong>
                  <p>{submission.message}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </section>

      <footer className="page-footer">
        <span>LEADFLOW <span className="footer-divider">/</span> AUTOMATIZACIÓN QUE CONECTA</span>
        <span>MENOS SEGUIMIENTO MANUAL. MÁS OPORTUNIDADES.</span>
      </footer>
    </main>
  );
}

function FlowStep({
  number,
  label,
  state,
}: {
  number: string;
  label: string;
  state: "done" | "active" | "next";
}) {
  return (
    <div className={`flow-step flow-step-${state}`}>
      <span className="flow-step-number">
        {state === "done" ? "✓" : number}
      </span>
      <span className="flow-step-label">{label}</span>
    </div>
  );
}

export default function App() {
  return window.location.pathname === "/crm" ? <CrmPage /> : <LeadFormPage />;
}
