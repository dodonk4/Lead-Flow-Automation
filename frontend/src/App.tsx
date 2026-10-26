import { useRef, useState, type FormEvent } from "react";

type FormValues = {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
};

type LeadResult = {
  id: string;
};

type WorkflowSuccess = {
  persistence: {
    status: "saved";
    operation: "created" | "updated";
  };
  data: LeadResult;
  notification: {
    status: "sent" | "failed" | "unconfirmed";
  };
};

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; result: WorkflowSuccess }
  | { status: "error"; message: string };

const initialValues: FormValues = {
  name: "",
  email: "",
  company: "",
  service: "",
  budget: "",
};

const webhookTimeoutMs = 30_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWorkflowSuccess(value: unknown): value is WorkflowSuccess {
  if (!isRecord(value) || !isRecord(value.persistence) || !isRecord(value.data)) {
    return false;
  }

  return (
    value.persistence.status === "saved" &&
    (value.persistence.operation === "created" ||
      value.persistence.operation === "updated") &&
    typeof value.data.id === "string" &&
    value.data.id.length > 0 &&
    isRecord(value.notification) &&
    (value.notification.status === "sent" ||
      value.notification.status === "failed" ||
      value.notification.status === "unconfirmed")
  );
}

function getFailureMessage(status: number, body: unknown): string {
  if (isRecord(body)) {
    if (body.error === "validation_error") {
      return "Revisa los datos del formulario y vuelve a intentarlo.";
    }
    if (body.error === "service_unassigned") {
      return "Este servicio todavía no tiene una regla de asignación. Elige otro servicio o contacta al equipo.";
    }
    if (
      body.error === "owner_lookup_failed" ||
      body.error === "owner_unavailable"
    ) {
      return "La asignación no está disponible en este momento. El lead no se guardó; inténtalo más tarde.";
    }
    if (
      isRecord(body.persistence) &&
      body.persistence.status === "not_saved"
    ) {
      return "Zoho confirmó que el lead no se guardó. Revisa los datos o la configuración antes de volver a intentarlo.";
    }
  }

  if (
    isRecord(body) &&
    isRecord(body.persistence) &&
    body.persistence.status === "unknown"
  ) {
    return "No pudimos confirmar si el lead se guardó. Verifica el resultado antes de volver a enviarlo para evitar duplicados.";
  }

  if (status === 503 || status === 409) {
    return "No pudimos confirmar si el lead se guardó. Verifica el resultado antes de volver a enviarlo para evitar duplicados.";
  }

  return "No se pudo completar el envío. Revisa el estado del lead antes de volver a intentarlo.";
}

function LeadFormPage() {
  const [values, setValues] = useState(initialValues);
  const [submission, setSubmission] = useState<SubmissionState>({
    status: "idle",
  });
  const submissionInProgress = useRef(false);

  const isSubmitting = submission.status === "submitting";

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInProgress.current) return;

    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL?.trim();

    if (!webhookUrl) {
      setSubmission({
        status: "error",
        message:
          "El formulario todavía no está conectado. Configura la URL del webhook de LeadFlow para poder enviar la consulta.",
      });
      return;
    }

    let parsedWebhookUrl: URL;
    try {
      parsedWebhookUrl = new URL(webhookUrl);
    } catch {
      setSubmission({
        status: "error",
        message:
          "La configuración del webhook no es válida. Contacta al equipo para que revise la URL.",
      });
      return;
    }

    if (
      !["http:", "https:"].includes(parsedWebhookUrl.protocol) ||
      parsedWebhookUrl.username ||
      parsedWebhookUrl.password
    ) {
      setSubmission({
        status: "error",
        message:
          "La configuración del webhook no es válida. Contacta al equipo para que revise la URL.",
      });
      return;
    }

    submissionInProgress.current = true;
    setSubmission({ status: "submitting" });

    const payload = {
      companyName: values.company.trim(),
      contactName: values.name.trim(),
      email: values.email.trim(),
      serviceRequested: values.service,
      details: `Presupuesto estimado: ${values.budget.trim()}`,
    };

    try {
      let response: Response;
      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        webhookTimeoutMs,
      );
      try {
        response = await fetch(parsedWebhookUrl, {
          method: "POST",
          headers: { "content-type": "text/plain" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } catch {
        setSubmission({
          status: "error",
          message:
            "La solicitud tardó demasiado o se interrumpió. El resultado puede no estar confirmado; verifica si el lead fue recibido antes de volver a enviarlo.",
        });
        return;
      } finally {
        window.clearTimeout(timeoutId);
      }

      let body: unknown = null;
      try {
        body = await response.json();
      } catch {
        // A malformed response cannot confirm whether Zoho saved the lead.
      }

      if (!response.ok) {
        setSubmission({
          status: "error",
          message: getFailureMessage(response.status, body),
        });
        return;
      }

      if (!isWorkflowSuccess(body)) {
        setSubmission({
          status: "error",
          message:
            "La respuesta del flujo no confirma un resultado válido. Verifica si el lead ya fue registrado antes de volver a enviarlo.",
        });
        return;
      }

      const expectedStatus = body.persistence.operation === "created" ? 201 : 200;
      if (response.status !== expectedStatus) {
        setSubmission({
          status: "error",
          message:
            "La respuesta del flujo no coincide con la operación informada. Verifica el resultado antes de volver a enviarlo.",
        });
        return;
      }

      setSubmission({ status: "success", result: body });
      setValues(initialValues);
    } finally {
      submissionInProgress.current = false;
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
              <div
                className={`status-panel ${
                  submission.result.notification.status === "sent"
                    ? "status-success"
                    : "status-warning"
                }`}
                role={
                  submission.result.notification.status === "sent"
                    ? "status"
                    : "alert"
                }
              >
                <span
                  className={`status-symbol ${
                    submission.result.notification.status === "sent"
                      ? "success-symbol"
                      : "warning-symbol"
                  }`}
                  aria-hidden="true"
                >
                  {submission.result.notification.status === "sent" ? "✓" : "!"}
                </span>
                <div>
                  <strong>
                    {submission.result.persistence.operation === "created"
                      ? "Lead registrado"
                      : "Lead actualizado"}
                    {submission.result.notification.status === "sent"
                      ? " y equipo notificado"
                      : submission.result.notification.status === "failed"
                        ? "; aviso rechazado"
                        : "; aviso pendiente de confirmación"}
                  </strong>
                  <p>
                    {submission.result.notification.status === "sent"
                      ? "La consulta quedó guardada en Zoho y la notificación se confirmó en Slack."
                      : submission.result.notification.status === "failed"
                        ? "La consulta quedó guardada en Zoho, pero Slack rechazó la notificación. No vuelvas a enviar el formulario; el equipo debe revisar solo el aviso."
                        : "La consulta quedó guardada en Zoho, pero no se pudo confirmar la entrega en Slack. Verifica el aviso antes de repararlo y no vuelvas a enviar el formulario."}
                  </p>
                </div>
              </div>
            )}

            {submission.status === "error" && (
              <div className="status-panel status-error" role="alert">
                <span className="status-symbol error-symbol" aria-hidden="true">!</span>
                <div>
                  <strong>Revisa el resultado del envío</strong>
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
  return <LeadFormPage />;
}
