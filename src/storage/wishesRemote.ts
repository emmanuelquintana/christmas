import { supabase } from "../lib/supabaseClient";

export type Wish = {
    id: string;
    name: string;
    message: string;
    x: number;
    y: number;
    createdAt: number;
};

type Row = {
    id: string;
    name: string;
    message: string;
    x: number;
    y: number;
    created_at: string;
};

const TABLE = "wishes";
const MAX = 200;

export async function fetchWishes(username: string, limit = MAX): Promise<Wish[]> {
    const { data, error } = await supabase
        .from(TABLE)
        .select("id,name,message,x,y,created_at")
        .eq("username", username)
        .order("created_at", { ascending: true })
        .limit(limit);

    if (error) throw error;

    return (data as Row[]).map((r) => ({
        id: r.id,
        name: r.name ?? "",
        message: r.message ?? "",
        x: Number(r.x),
        y: Number(r.y),
        createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
    }));
}

export async function insertWish(input: { id: string; name: string; message: string; x: number; y: number; username: string }) {
    const { error } = await supabase.from(TABLE).insert({
        id: input.id,
        name: input.name ?? "",
        message: input.message,
        x: input.x,
        y: input.y,
        username: input.username,
    });


    if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
        throw error;
    }
}

export function subscribeToNewWishes(username: string, onInsert: (wish: Wish) => void) {
    const channel = supabase
        .channel(`wishes-inserts-${username}`)
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: TABLE, filter: `username=eq.${username}` },
            (payload) => {
                const r = payload.new as Row;
                onInsert({
                    id: r.id,
                    name: r.name ?? "",
                    message: r.message ?? "",
                    x: Number(r.x),
                    y: Number(r.y),
                    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
                });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
