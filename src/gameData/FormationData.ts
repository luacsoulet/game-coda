export type FormationFile = {
    [key: string]: FormationData;
}


type FormationData = {
    type: string,
    count: number,
    enemyType: string,
    spacing?: number | undefined,
    direction?: string,
    radius?: number,
}

