import { useEffect, useState } from "react";
import "./crm.css";

type Advisor = {
  id: string;
  name: string;
  email: string;
};

type Lead = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  serviceRequested: string;
  details: string | null;
  assignedAdvisorId: string | null;
  assignedAdvisor: Advisor | null;
  createdAt: string;
  updatedAt: string;
};

type LoadState = "loading" | "ready" | "error";

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3000/api"
).replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAdvisor(value: unknown): value is Advisor {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string"
  );
}

function isLead(value: unknown): value is Lead {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.companyName === "string" &&
    typeof value.contactName === "string" &&
    typeof value.email === "string" &&
    typeof value.serviceRequested === "string" &&
    (typeof value.details === "string" || value.details === null) &&
    (typeof value.assignedAdvisorId === "string" ||
      value.assignedAdvisorId === null) &&
    (isAdvisor(value.assignedAdvisor) || value.assignedAdvisor === null) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

async function requestLeadList(signal: AbortSignal): Promise<Lead[]> {
  const response = await fetch(`${apiBaseUrl}/leads`, { signal });
  if (!response.ok) throw new Error("No se pudo cargar la lista de leads.");

  const body: unknown = await response.json();
  if (!isRecord(body) || !Array.isArray(body.data) || !body.data.every(isLead)) {
    throw new Error("La respuesta de leads no es válida.");
  }

  return body.data;
}

async function requestLead(id: string, signal: AbortSignal): Promise<Lead> {
  const response = await fetch(`${apiBaseUrl}/leads/${encodeURIComponent(id)}`, {
    signal,
  });
  if (!response.ok) throw new Error("No se pudo cargar el detalle del lead.");

  const body: unknown = await response.json();
  if (!isRecord(body) || !isLead(body.data)) {
    throw new Error("El detalle del lead no es válido.");
  }

  return body.data;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [listState, setListState] = useState<LoadState>("loading");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [detailState, setDetailState] = useState<LoadState>("ready");
  const [errorMessage, setErrorMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setListState("loading");
    setErrorMessage("");

    requestLeadList(controller.signal)
      .then((records) => {
        setLeads(records);
        setListState("ready");
        setSelectedLeadId((currentId) =>
          currentId && records.some((record) => record.id === currentId)
            ? currentId
            : null,
        );
        if (!records.length) setSelectedLead(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los leads.",
        );
        setListState("error");
      });

    return () => controller.abort();
  }, [refresh]);

  useEffect(() => {
    if (!selectedLeadId) {
      setSelectedLead(null);
      setDetailState("ready");
      return;
    }

    const controller = new AbortController();
    setSelectedLead(null);
    setDetailState("loading");

    requestLead(selectedLeadId, controller.signal)
      .then((record) => {
        setSelectedLead(record);
        setDetailState("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el detalle del lead.",
        );
        setDetailState("error");
      });

    return () => controller.abort();
  }, [selectedLeadId]);

  function refreshLeads() {
    setSelectedLeadId(null);
    setSelectedLead(null);
    setRefresh((value) => value + 1);
  }

  return (
    <main className="page-shell crm-shell">
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
          <a href="/">Nuevo lead</a>
          <a href="/crm" aria-current="page">CRM</a>
        </nav>
        <div className="topbar-note">
          <span className="live-dot" />
          CRM simulado
        </div>
      </header>

      <section className="crm-content" aria-labelledby="crm-title">
        <div className="crm-heading">
          <div>
            <p className="form-kicker">VISTA GENERAL</p>
            <h1 id="crm-title">Leads <span>recibidos.</span></h1>
            <p className="crm-description">
              Consulta cada oportunidad y quién se encarga de ella.
            </p>
          </div>
          <button
            className="crm-refresh-button"
            onClick={refreshLeads}
            type="button"
            disabled={listState === "loading"}
          >
            <span aria-hidden="true">↻</span> Actualizar
          </button>
        </div>

        {listState === "error" && (
          <div className="crm-message crm-error" role="alert">
            <strong>No se pudieron cargar los leads</strong>
            <p>{errorMessage}</p>
            <button className="text-button" onClick={refreshLeads} type="button">
              Intentar de nuevo
            </button>
          </div>
        )}

        {listState === "loading" && (
          <div className="crm-message" role="status">
            <span className="button-spinner crm-spinner" aria-hidden="true" />
            <span>Cargando leads…</span>
          </div>
        )}

        {listState === "ready" && leads.length === 0 && (
          <div className="crm-empty">
            <span className="crm-empty-icon" aria-hidden="true">↗</span>
            <h2>Aún no hay leads</h2>
            <p>Cuando alguien complete el formulario, aparecerá aquí.</p>
            <a className="crm-primary-link" href="/">Crear un lead</a>
          </div>
        )}

        {listState === "ready" && leads.length > 0 && (
          <div className="crm-layout">
            <section className="crm-list-card" aria-label="Lista de leads">
              <div className="crm-list-header">
                <div>
                  <h2>Todos los leads</h2>
                  <p>{leads.length} {leads.length === 1 ? "registro" : "registros"}</p>
                </div>
              </div>
              <div className="crm-table-scroll">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Empresa / contacto</th>
                      <th>Servicio</th>
                      <th>Estado</th>
                      <th>Asesor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className={selectedLeadId === lead.id ? "is-selected" : ""}
                      >
                        <td>
                          <button
                            className="crm-lead-select"
                            onClick={() => setSelectedLeadId(lead.id)}
                            type="button"
                            aria-label={`Ver detalle de ${lead.companyName}`}
                          >
                            <strong>{lead.companyName}</strong>
                            <span>{lead.contactName}</span>
                          </button>
                        </td>
                        <td>{lead.serviceRequested}</td>
                        <td>
                          <span
                            className={`crm-status ${
                              lead.assignedAdvisor ? "is-assigned" : "is-pending"
                            }`}
                          >
                            <span />
                            {lead.assignedAdvisor ? "Asignado" : "Pendiente"}
                          </span>
                        </td>
                        <td>
                          {lead.assignedAdvisor?.name ?? (
                            <span className="crm-muted">Sin asignar</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="crm-detail-card" aria-label="Detalle del lead">
              {detailState === "loading" && (
                <div className="crm-detail-placeholder" role="status">
                  <span className="button-spinner crm-spinner" aria-hidden="true" />
                  Cargando detalle…
                </div>
              )}
              {detailState === "error" && (
                <div className="crm-detail-placeholder crm-detail-error" role="alert">
                  {errorMessage}
                </div>
              )}
              {detailState === "ready" && !selectedLead && (
                <div className="crm-detail-placeholder">
                  <span className="crm-detail-mark" aria-hidden="true">↖</span>
                  <strong>Selecciona un lead</strong>
                  <span>Su información completa aparecerá aquí.</span>
                </div>
              )}
              {detailState === "ready" && selectedLead && (
                <div className="crm-detail">
                  <div className="crm-detail-top">
                    <span className="crm-detail-icon" aria-hidden="true">
                      {selectedLead.companyName.slice(0, 1).toUpperCase()}
                    </span>
                    <span
                      className={`crm-status ${
                        selectedLead.assignedAdvisor ? "is-assigned" : "is-pending"
                      }`}
                    >
                      <span />
                      {selectedLead.assignedAdvisor ? "Asignado" : "Pendiente"}
                    </span>
                  </div>
                  <h2>{selectedLead.companyName}</h2>
                  <p className="crm-detail-subtitle">{selectedLead.serviceRequested}</p>
                  <div className="crm-detail-fields">
                    <DetailField label="Contacto" value={selectedLead.contactName} />
                    <DetailField label="Email" value={selectedLead.email} />
                    <DetailField
                      label="Fecha de ingreso"
                      value={formatDate(selectedLead.createdAt)}
                    />
                    <DetailField
                      label="Asesor asignado"
                      value={selectedLead.assignedAdvisor?.name ?? "Pendiente de asignación"}
                    />
                    {selectedLead.assignedAdvisor && (
                      <DetailField
                        label="Email del asesor"
                        value={selectedLead.assignedAdvisor.email}
                      />
                    )}
                    {selectedLead.details && (
                      <DetailField label="Información adicional" value={selectedLead.details} />
                    )}
                  </div>
                  <p className="crm-record-id">ID · {selectedLead.id}</p>
                </div>
              )}
            </aside>
          </div>
        )}
      </section>

      <footer className="page-footer">
        <span>LEADFLOW <span className="footer-divider">/</span> CRM SIMULADO</span>
        <span>UNA VISTA SENCILLA DE CADA OPORTUNIDAD.</span>
      </footer>
    </main>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="crm-detail-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
