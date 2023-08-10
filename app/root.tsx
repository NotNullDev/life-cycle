import type {ActionArgs, LinksFunction, LoaderArgs} from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration, useLoaderData, useNavigation,
} from "@remix-run/react";
import tailwind from "./tailwind.css";
import {destroySession, getSession} from "~/sessions";
import {Button} from "~/lib/components/ui/button";
import {redirect} from "@remix-run/node";
import {TypographyMuted} from "~/lib/components/ui/typography/muted";
import { TypographyH2 } from "./lib/components/ui/typography/h2";
import {Separator} from "~/lib/components/ui/separator";
import {cn} from "~/lib/utils";

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
  const navigation = useNavigation();

  console.log(navigation.location)

  return (
    <html lang="en" className="dark" style={{background: "black"}}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-screen flex flex-col">
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
        <div className="p-4">
          <div>
            <TypographyH2>Settings page</TypographyH2>
            <TypographyMuted>Settings description</TypographyMuted>
            <Separator  className='my-4' />
          </div>
          <div className="flex flex-1">
            <div>
              <nav className="w-[200px]">
                <ul className="flex flex-col gap-2">
                  <li className={cn(
                    'p-1 bg-muted rounded-md',
                    'hover:cursor-pointer',
                    {
                      'hover:underline': navigation.location?.pathname !== "/",
                      'bg-muted': navigation.location?.pathname === "/"
                    }
                  )}>
                    <Link  to={"/"}>Home</Link>
                  </li>
                  <li className={cn(
                    'p-1 bg-muted rounded-md',
                    'hover:cursor-pointer',
                    {
                      'hover:underline': navigation.location?.pathname !== "/settings",
                      'bg-muted': navigation.location?.pathname === "/settings"
                    }
                  )}>
                    <Link to={"/settings"}>Settings</Link>
                  </li>
                </ul>
              </nav>
            </div>
            <Outlet />
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
