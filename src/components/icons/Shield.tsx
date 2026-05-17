import ShieldIcon from "./svg/pixel-shield.svg";
import ShieldIconEmpty from "./svg/pixel-shield-empty.svg";

export const Shield = (
  {filled = true, ...props}: React.SVGProps<SVGSVGElement> & { filled?: boolean },
) =>
  filled ? (
    <ShieldIcon
      {...props}
      style={{ width: "100%", height: "100%", ...props.style }}
    />
  ) : (
    <ShieldIconEmpty
      {...props}
      style={{ width: "100%", height: "100%", ...props.style }}
    />
  );
