import { BaseService } from "./BaseService";

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  propertyName: string;
  unitNumber: string;
  currentStage: string;
}

const INITIAL_PROFILES: ClientProfile[] = [
  { id: "client-1", name: "João Silva", email: "joao@email.com", propertyName: "Edifício Aurora", unitNumber: "204", currentStage: "inspection_enabled" }
];

class ClientStageService extends BaseService<ClientProfile> {
  constructor() {
    super("a2_client_profiles", INITIAL_PROFILES);
  }

  getAllProfiles() { return [...this.items]; }
  getClientProfile(id: string) { return this.getById(id); }
}

export const clientStageService = new ClientStageService();
