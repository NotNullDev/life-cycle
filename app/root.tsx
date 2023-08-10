import type {ActionArgs, LinksFunction, LoaderArgs} from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration, useLoaderData,
} from "@remix-run/react";
import tailwind from "./tailwind.css";
import {destroySession, getSession} from "~/sessions";
import {Button} from "~/lib/components/ui/button";
import {redirect} from "@remix-run/node";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwind },
];

export async function loader({request}: LoaderArgs) {
  return {
    userLoggedIn: !!(await getSession(request.headers.get("Cookie"))).get("userId")
  }
}

export async function action({request}: ActionArgs) {
    const form = await request.formData();
    const action = form.get("_action");

    if (action === "logout") {
        const session = await getSession(request.headers.get("Cookie"));
        session.unset("userId");
        return redirect("/", {
          headers: {
            "Set-Cookie": await destroySession(session)
          }
        })
    }

    return null;
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <html lang="en" className="dark" style={{background: "black"}}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-screen">
        <header className="p-4 flex justify-between container mx-auto">
          <Link to={"/"}>Life cycle</Link>
          <div>
            {data.userLoggedIn && (
                <Form method="post">
                  <Button variant="ghost" name="_action" value="logout">Logout</Button>
                </Form>
            )}
            {!data.userLoggedIn && <Link to={"/login"}>
              <Button variant="ghost">Login</Button>
            </Link>}
          </div>
        </header>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
