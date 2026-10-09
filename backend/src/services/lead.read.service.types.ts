import type { Prisma } from "@prisma/client";

export type LeadWithAdvisor = Prisma.LeadGetPayload<{
  include: {
    assignedAdvisor: {
      select: { id: true; name: true; email: true };
    };
  };
}>;

export type ListLeadsUseCase = () => Promise<LeadWithAdvisor[]>;
export type GetLeadUseCase = (id: string) => Promise<LeadWithAdvisor | null>;

export type LeadReadUseCases = {
  listLeads: ListLeadsUseCase;
  getLeadById: GetLeadUseCase;
};
