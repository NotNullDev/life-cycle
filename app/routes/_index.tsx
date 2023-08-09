import type {ActionArgs, LoaderArgs, V2_MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";

import {Button} from "~/lib/components/ui/button";
import {db} from "../../db/db";
import {users} from "../../db/schema/schema";
import {Form, useLoaderData, useNavigation} from "@remix-run/react";
import {Input} from "~/lib/components/ui/input";
import {commitSession, getSession} from "~/sessions";

export const meta: V2_MetaFunction = () => {
    return [
        {title: "LifeCycle"},
        {name: "description", content: "Personal records tracking software"},
    ];
};

export async function loader({request, params, context}: LoaderArgs) {
    console.log("in the loader!");

    let session = await getSession(request.headers.get("Cookie"));
    let visits = session.get("visits");
    if (!visits) {
        visits = 1;
    }

    console.log(`current user visited ${visits} times`);

    const allUsers = await db.select().from(users).execute();

    session.set("visits", Number(visits) + 1);

    return json(allUsers, {
        headers: {
            "Set-Cookie": await commitSession(session)
        }
    });
}

export async function action({request, params, context}: ActionArgs) {
    console.log("in the action!");
    return null;
}

export default function Index() {
    const users = useLoaderData<typeof loader>()
    const navigation = useNavigation();
    const isBusy = navigation.state !== "idle";

    return (
        <div className="flex flex-col container mx-auto p-16 gap-2">
            <div>found {users.length} users</div>
            <Form className="flex flex-col gap-2" method="POST">
                <Input type="text" name="name" placeholder="Name"/>
                <Input type="email" name="email" placeholder="Email"/>
                <Button type="submit">Create user</Button>
            </Form>
            {
                isBusy && <div>busy...</div>
            }
        </div>
    );
}
