import LightningIcon from "./svg/pixel-lightning.svg";
import LightningIconEmpty from "./svg/pixel-lightning-empty.svg";

export const Lightning = (
  {filled = true, ...props}: React.SVGProps<SVGSVGElement> & { filled?: boolean },
) =>
  filled ? (
    <LightningIcon
      {...props}
      style={{ width: "100%", height: "100%", ...props.style }}
    />
  ) : (
    <LightningIconEmpty
      {...props}
      style={{ width: "100%", height: "100%", ...props.style }}
    />
  );
