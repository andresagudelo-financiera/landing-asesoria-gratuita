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
    { email: 'elizabeth.rojas@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/elizabeth-rojas-financieramentecu/30min' },
    { email: 'johana.bernal@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/johana-bernal-financieramentecu/30min' },
    { email: 'kevin.gonzalez@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/kevin-gonzalez-financieramentecu/30min' },
    { email: 'monica.navarro@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/monica-navarro-financieramentecu/30min' },
    { email: 'robinson.sanchez@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/robinson-sanchez-financieramentecu/30min' },
    { email: 'viviana.huertas@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/viviana-huertas-financieramentecu/30min' },
    { email: 'yohan.espana@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43', active: true, calendlyUrl: 'https://calendly.com/yohan-espana-financieramentecu/30min' }
];

const teamAna: CoachConfig[] = [
    //{ email: 'ana.mendiola@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true },
    { email: 'lina.cardona@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: false, calendlyUrl: 'https://calendly.com/lina-cardona-financieramentecu/30min' },
    { email: 'luisa.rios@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/luisa-rios-financieramentecu/30min' },
    { email: 'luz.pinedo@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/luz-pinedo-financieramentecu/asesoria-financiera' },
    { email: 'natalia.guerrero@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/natalia-guerrero-financieramentecu/30min' },
    { email: 'nestor.baute@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/nestor-baute-financieramentecu/30min' },
    { email: 'olga.rico@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/olga-rico-financieramentecu/asesoria-financiera-cortesia' },
    { email: 'renier.gonzalez@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/renier-gonzalez-financieramentecu/30min' },
    { email: 'sandy.carrillo@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/sandy-carrillo-financieramentecu/30min' },
    { email: 'sivoney.perez@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c', active: true, calendlyUrl: 'https://calendly.com/sivoney-perez-financieramentecu/30min' }
];

const teamJhon: CoachConfig[] = [
    //{ email: 'daniela.barrera@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true },
    { email: 'jhon.acevedo@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/jhon-acevedo-financieramentecu/30min' },
    { email: 'bryan.rozo@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/bryan-rozo-financieramentecu/asesoria-de-cortesia-finanzas-practicas' },
    { email: 'diego.ruiz@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/diego-ruiz-financieramentecu/30min' },
    { email: 'john.carmona@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/john-carmona-financieramentecu/30min' },
    { email: 'julieta.villa@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/julieta-villa-financieramentecu/30min' },
    { email: 'julieth.vargas@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/julieth-vargas-financieramentecu/30min' },
    { email: 'karen.camacho@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/karen-camacho-financieramentecu/obsequio-sesion-plan-financiero-con-karen-camacho' },
    { email: 'lorena.martinez@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/lorena-martinez-financieramentecu/30min' },
    { email: 'marcela.espitia@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/marcela-espitia-financieramentecu/30min' },
    { email: 'mauricio.urrea@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true },
    { email: 'paula.duque@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/paula-duque-financieramentecu/30min' },
    { email: 'yesica.montoya@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa', active: true, calendlyUrl: 'https://calendly.com/yesica-montoya-financieramentecu/30min' }
];

const teamMalu: CoachConfig[] = [
    { email: 'maria.mendiola@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/malu-mendiola/asesoria-financiera' },
    { email: 'alejandra.gutierrez@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/alejandra-gutierrez-financieramentecu/30min' },
    { email: 'andrea.reyes@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/andrea-reyes-financieramentecu/30min' },
    { email: 'isul.jimenez@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/isul-jimenez-financieramentecu/30min' },
    { email: 'luis.castano@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/luis-castano-financieramentecu/30min' },
    { email: 'monica.mendieta@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/monica-mendieta-financieramentecu/30min' },
    { email: 'paola.roa@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/paola-roa-financieramentecu/30min' },
    { email: 'tatiana.restrepo@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/tatiana-restrepo-financieramentecu/30min' },
    { email: 'victoria.pelaez@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3', active: true, calendlyUrl: 'https://calendly.com/victoria-pelaez-financieramentecu/30min' }
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
