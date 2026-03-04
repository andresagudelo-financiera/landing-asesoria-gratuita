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
};

const teamAndrea: CoachConfig[] = [
    { email: 'andrea.estrada@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'alexandra.perdomo@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'elizabeth.rojas@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'johana.bernal@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'kevin.gonzalez@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'monica.navarro@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'robinson.sanchez@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'viviana.huertas@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' },
    { email: 'yohan.espana@financieramentecu.com', leader: LEADERS.ANDREA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/30b26225-a3a8-47e9-80bb-f07a8ce2db43' }
];

const teamAna: CoachConfig[] = [
    //{ email: 'ana.mendiola@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'lina.cardona@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'luisa.rios@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'luz.pinedo@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'natalia.guerrero@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'nestor.baute@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'olga.rico@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'renier.gonzalez@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'sandy.carrillo@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' },
    { email: 'sivoney.perez@financieramentecu.com', leader: LEADERS.ANA, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/c4d098dc-1285-4147-96fe-e98efa37852c' }
];

const teamJhon: CoachConfig[] = [
    //{ email: 'daniela.barrera@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'jhon.acevedo@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'bryan.rozo@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'diego.ruiz@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'john.carmona@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'julieta.villa@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'julieth.vargas@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'karen.camacho@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'lorena.martinez@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'marcela.espitia@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'mariana.narvaez@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'mauricio.urrea@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'paula.duque@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' },
    { email: 'yesica.montoya@financieramentecu.com', leader: LEADERS.JHON, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/434a9599-5ff7-4125-afd0-12aeaa48b1aa' }
];

const teamMalu: CoachConfig[] = [
    { email: 'maria.mendiola@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'alejandra.gutierrez@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'andrea.reyes@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'isul.jimenez@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'jacobo.arguello@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'luis.castano@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'monica.mendieta@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'paola.roa@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'tatiana.restrepo@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' },
    { email: 'victoria.pelaez@financieramentecu.com', leader: LEADERS.MALU, webhook: 'https://functions-api.clint.digital/endpoints/integration/webhook/da4eab3d-c775-4a33-b5f5-8cb14ed323d3' }
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
