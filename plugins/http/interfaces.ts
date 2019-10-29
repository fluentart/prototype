export interface HTTPRoute {
    id: string;
    method: "get" | "post" | "delete" | "put";
    route?: string;
    apikey?: string;
}