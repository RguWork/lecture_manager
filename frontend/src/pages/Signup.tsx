import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAndLogin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Loader2 } from "lucide-react";

export default function Signup() {
  const [u, setU] = useState("");
  const [e, setE] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [err, setErr] = useState<string | string[]>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(evn: React.FormEvent<HTMLFormElement>) {
    evn.preventDefault();
    setErr("");
    if (p1 !== p2) {
      setErr("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await registerAndLogin(u, e, p1, p2);
      navigate("/");
    } catch (err: any) {
      //DRF may return per-field errors
      const data = err?.response?.data;
      if (data) {
        const messages: string[] = [];
        for (const key of Object.keys(data)) {
          const v = data[key];
          if (Array.isArray(v)) messages.push(...v);
          else if (typeof v === "string") messages.push(v);
          else messages.push(JSON.stringify(v));
        }
        setErr(messages.length ? messages : "Sign up failed.");
      } else {
        setErr("Sign up failed.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-svh grid place-items-center bg-gradient-to-b from-muted/40 to-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <img src="/Sumori.png" alt="Sumori logo" className="h-20 w-20 rounded-md object-contain" />
            <div>
              <CardTitle className="text-xl">Create your Sumori account</CardTitle>
              <CardDescription>Sign up to track lectures, notes, and summaries.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {err && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {Array.isArray(err) ? err.map((m, i) => <div key={i}>{m}</div>) : err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="Pick a username"
                  value={u}
                  onChange={(ev) => setU(ev.target.value)}
                  className="pl-9"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={e}
                  onChange={(ev) => setE(ev.target.value)}
                  className="pl-9"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={p1}
                  onChange={(ev) => setP1(ev.target.value)}
                  className="pl-9"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password2">Confirm password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password2"
                  type="password"
                  placeholder="Re-enter your password"
                  value={p2}
                  onChange={(ev) => setP2(ev.target.value)}
                  className="pl-9"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 items-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary underline underline-offset-4">Log in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
