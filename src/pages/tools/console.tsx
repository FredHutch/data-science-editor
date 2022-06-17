import React, { lazy } from "react"
import Suspense from "../../components/ui/Suspense"
const Console = lazy(() => import("../../components/console/Console"))


export const frontmatter = {
    title: "Console view",
    description: "Console message viewer.",
}

export default function Page() {
    return (
        <Suspense>
            <Console
                showToolbar={true}
                showFiles={true}
                showLevel={true}
                showPopout={false}
                showSerial={true}
            />
        </Suspense>
    )
}
