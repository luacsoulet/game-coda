type EnemyConfig = {
    health: number,
    speed: number,
    points: number,
    textures: {
        default: string,
        speed_1: string,
        speed_2: string,
    },
    scale: number,
    body: {
        radius: number,
        offsetX: number,
        offsetY: number,
    },
    weapon?: {
        damage: number,
        fireRate: number,
        projectileSpeed: number,
        projectileTexture: string,
    },
}