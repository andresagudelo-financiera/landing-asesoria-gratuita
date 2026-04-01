export const LEADERS = {
    ANDREA: 'Andrea',
    ANA: 'Ana Med',
    JHON: 'Jhon',
    MALU: 'Malu'
};

export type CoachConfig = {
    email: string;
    leader: string;
    webhook: string;
    active?: boolean; // true por defecto si se omite
    calendlyUrl?: string;
};

const teamAndrea: CoachConfig[] = [
    { email: 'andrea.estrada@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/andrea-estrada-financieramentecu/plan-financiero' },
    { email: 'alexandra.perdomo@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true },
    { email: 'elizabeth.rojas@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/elizabeth-rojas-financieramentecu/30min' },
    { email: 'johana.bernal@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/johana-bernal-financieramentecu/30min' },
    { email: 'kevin.gonzalez@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: false },
    { email: 'monica.navarro@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/monica-navarro-financieramentecu/30min' },
    { email: 'robinson.sanchez@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendar.app.google/GRsHVZvooF6PhVYc9' },
    { email: 'viviana.huertas@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/viviana-huertas-financieramentecu/30min' },
    { email: 'yohan.espana@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/yohan-espana-financieramentecu/30min' }
];

const teamAna: CoachConfig[] = [
    //{ email: 'ana.mendiola@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true },
    { email: 'lina.cardona@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: false },
    { email: 'luisa.rios@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true },
    { email: 'luz.pinedo@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/luz-pinedo-financieramentecu/30min' },
    { email: 'natalia.guerrero@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/natalia-guerrero-financieramentecu/30min' },
    { email: 'nestor.baute@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true },
    { email: 'olga.rico@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true },
    { email: 'renier.gonzalez@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/renier-gonzalez-financieramentecu/30min' },
    { email: 'sandy.carrillo@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/sandy-carrillo-financieramentecu/30min' },
    { email: 'sivoney.perez@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/sivoney-perez-financieramentecu/30min' }
];

const teamJhon: CoachConfig[] = [
    //{ email: 'daniela.barrera@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true },
    { email: 'jhon.acevedo@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true },
    { email: 'bryan.rozo@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/bryan-rozo-financieramentecu/asesoria-de-cortesia-finanzas-practicas' },
    { email: 'diego.ruiz@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true },
    { email: 'john.carmona@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/john-carmona-financieramentecu/30min' },
    { email: 'julieta.villa@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true },
    { email: 'julieth.vargas@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/julieth-vargas-financieramentecu/30min' },
    { email: 'karen.camacho@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true },
    { email: 'lorena.martinez@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true },
    { email: 'marcela.espitia@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true },
    { email: 'mariana.narvaez@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true },
    { email: 'mauricio.urrea@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true },
    { email: 'paula.duque@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true },
    { email: 'yesica.montoya@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true }
];

const teamMalu: CoachConfig[] = [
    { email: 'maria.mendiola@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true },
    { email: 'alejandra.gutierrez@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/alejandra-gutierrez-financieramentecu/30min' },
    { email: 'andrea.reyes@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true },
    { email: 'isul.jimenez@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/isul-jimenez-financieramentecu/30min' },
    { email: 'jacobo.arguello@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true },
    { email: 'luis.castano@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true },
    { email: 'monica.mendieta@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/monica-mendieta-financieramentecu/30min' },
    { email: 'paola.roa@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true },
    { email: 'tatiana.restrepo@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/tatiana-restrepo-financieramentecu/30min' },
    { email: 'victoria.pelaez@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true }
];

function interleaveTeams(...teams: CoachConfig[][]): CoachConfig[] {
    const result: CoachConfig[] = [];
    const maxLength = Math.max(...teams.map(t => t.length));
    for (let i = 0; i < maxLength; i++) {
        for (const team of teams) {
            if (i < team.length) {
                result.push(team[i]);
            }
        }
    }
    return result;
}

// 43 coaches properly interleaved so the round-robin is equitable per team
export const COACH_CONFIG = interleaveTeams(teamAndrea, teamAna, teamJhon, teamMalu);
