import {
  findLeadWithAdvisorById,
  listLeads as listLeadsFromDatabase,
} from "../repositories/lead.repository";
import type {
  GetLeadUseCase,
  ListLeadsUseCase,
} from "./lead.read.service.types";

export const listLeads: ListLeadsUseCase = () => listLeadsFromDatabase();

export const getLeadById: GetLeadUseCase = (id) =>
  findLeadWithAdvisorById(id);
