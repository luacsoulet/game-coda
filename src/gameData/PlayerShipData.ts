type PlayerShipsData = {
    [key: string]: PlayerShipData;
}

type PlayerShipData = {
    movementSpeed: number;
    health: number;
    shootingRate: number;
    texture: string;
    body: ShipBodyData;
}