import { ReactElement } from "react";
import { IconContext } from "react-icons";



export default function SelectableIcon({ Icon, selected } : { Icon : ReactElement, selected : boolean }) {

    return <>
        <IconContext.Provider value={{ style: { color: "white" } }}>
            {Icon}
        </IconContext.Provider>
    </>
}