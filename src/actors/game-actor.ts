export interface UpdateParams {
    pixelsPerSecond: number;
    delta: number;

    [propName: string]: any;
};

export interface GameActor {
    destroy(): void;

    update(updateParams: UpdateParams): void;

    shouldDestroy(): boolean;
}
