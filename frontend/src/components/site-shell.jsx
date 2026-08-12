import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SiteShell({
  children,
  hideFooter = false
}) {
  return /*#__PURE__*/_jsxs("div", {
    className: "flex min-h-screen flex-col bg-background",
    children: [/*#__PURE__*/_jsx(Navbar, {}), /*#__PURE__*/_jsx("main", {
      className: "flex-1 pt-[3.75rem]",
      children: children
    }), !hideFooter && /*#__PURE__*/_jsx(Footer, {})]
  });
}