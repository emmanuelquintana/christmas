import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import SkyDecor from "./SkyDecor";
import StarfieldCanvas from "./StarfieldCanvas";
import SnowCanvas from "./SnowCanvas";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export default function WelcomeAuth() {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"register" | "login">("register");
    const reduced = usePrefersReducedMotion();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = name.trim().toLowerCase().replace(/\s+/g, '-');
        if (!user) return;

        setLoading(true);

        try {
            // 1. Check if user exists
            const { count, error: countErr } = await supabase
                .from("users")
                .select("*", { count: "exact", head: true })
                .eq("username", user);

            if (countErr) throw countErr;

            if (mode === "register") {
                // REGISTER MODE
                if (count && count > 0) {
                    alert("Este nombre ya tiene dueño. ¡Intenta otro! 🎄");
                    setLoading(false);
                    return;
                }

                const { error } = await supabase
                    .from("users")
                    .insert({ username: user });

                if (error) throw error;
            } else {
                // LOGIN MODE
                if (!count || count === 0) {
                    alert("No encontramos ese espacio. ¿Seguro que lo escribiste bien?");
                    setLoading(false);
                    return;
                }
            }

            // Redirect to user's world
            window.location.href = `/?u=${user}`;
        } catch (err) {
            console.error(err);
            alert("Error al ingresar. Intenta de nuevo.");
            setLoading(false);
        }
    };

    return (
        <div className="scene" style={{ position: "fixed", inset: 0, zIndex: 9999, height: "100%" }}>
            {/* Background Decor */}
            <div className="skyArea" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)" }}>
                <StarfieldCanvas mode="night" reducedMotion={reduced} />
                <SkyDecor reducedMotion={reduced} />
                <SnowCanvas mode="night" reducedMotion={reduced} />
            </div>

            <div className="modalOverlay" style={{ zIndex: 200, background: "transparent" }}>
                <div className="introCenter" style={{ width: "min(360px, 90%)", gap: 20, background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(20px)" }}>
                    <div className="titles" style={{ textAlign: "center" }}>
                        <div className="title" style={{ fontSize: 26 }}>Navidad Mágica ✨</div>
                        <div className="subtitle" style={{ fontSize: 15, marginTop: 8, color: "rgba(255,255,255,0.9)" }}>
                            {mode === "register" ? "Crea tu propio mundo de deseos" : "Entra a tu espacio"}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <label className="wishLabel" htmlFor="username" style={{ fontSize: 13 }}>
                                {mode === "register" ? "Elige un nombre de usuario único" : "Tu nombre de usuario"}
                            </label>
                            <input
                                id="username"
                                className="wishInput"
                                placeholder="Ej. Eduardo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={20}
                                required
                                style={{ fontSize: 16, padding: "12px" }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="send"
                            disabled={loading}
                            style={{ justifyContent: "center", display: "flex", fontSize: 16, fontWeight: 600 }}
                        >
                            {loading ? "Verificando..." : (mode === "register" ? "Crear mi espacio 🎁" : "Entrar 🎄")}
                        </button>
                    </form>

                    <div className="introTip" style={{ textAlign: "center", lineHeight: 1.5, opacity: 0.8 }}>
                        {mode === "register" ? (
                            <span onClick={() => setMode("login")} style={{ textDecoration: "underline", cursor: "pointer" }}>
                                ¿Ya tienes un espacio? Entra aquí
                            </span>
                        ) : (
                            <span onClick={() => setMode("register")} style={{ textDecoration: "underline", cursor: "pointer" }}>
                                ¿Quieres crear uno nuevo? Regístrate
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
