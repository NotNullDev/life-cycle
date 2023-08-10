import React from "react";

type TypographyH2Props = React.ComponentPropsWithRef<"h2">

export function TypographyH2({...props}: TypographyH2Props) {
  return (
    <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0" {...props} ref={props.ref}>
      {props.children}
    </h1>
  )
}
