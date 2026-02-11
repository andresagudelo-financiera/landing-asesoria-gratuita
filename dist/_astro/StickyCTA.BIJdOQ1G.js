import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as t}from"./index.DiEladB3.js";function c({ctaUrl:n="https://viewer.leapchat.digital/mv-asesoria-gratuita"}){const[a,s]=t.useState(!1);return t.useEffect(()=>{const r=()=>{const o=window.scrollY;s(o>500)};return window.addEventListener("scroll",r,{passive:!0}),()=>{window.removeEventListener("scroll",r)}},[]),e.jsx("div",{className:`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        transition-all duration-500 ease-out
        ${a?"opacity-100 translate-y-0":"opacity-0 translate-y-10 pointer-events-none"}
      `,children:e.jsxs("a",{href:n,target:"_blank",rel:"noopener noreferrer",className:`\r
          relative\r
          bg-claudia-accent-green\r
          text-claudia-dark font-bold\r
          px-8 py-4 rounded-full\r
          text-sm truncate md:text-lg uppercase tracking-wider\r
          shadow-lg shadow-claudia-accent-green/20\r
          transition-all duration-300\r
          hover:scale-105\r
          active:scale-95\r
          flex items-center gap-3\r
          border-2 border-white/10 hover:border-white/30\r
        `,children:[e.jsx("span",{children:"OBTENER MI PLAN"}),e.jsx("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 8l4 4m0 0l-4 4m4-4H3"})})]})})}export{c as default};
