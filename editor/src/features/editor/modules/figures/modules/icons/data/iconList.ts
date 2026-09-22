import type { IconItem, IconCategory } from "../types/icon";

const iconSectionsRaw: { title: IconCategory; icons: string[] }[] = [
  {
    title: "Animals",
    icons: [
      "mdi:dog","mdi:cat","mdi:bird","mdi:fish","mdi:cow",
      "mdi:horse","mdi:rabbit","mdi:turtle","mdi:elephant","mdi:duck",
      "mdi:bee","mdi:butterfly","mdi:bug","mdi:spider","mdi:snake",
      "mdi:penguin","mdi:owl","mdi:sheep","mdi:paw","mdi:ladybug",
    ],
  },
  {
    title: "Education",
    icons: [
      "mdi:book","mdi:book-open-page-variant","mdi:school","mdi:pencil","mdi:pen",
      "mdi:notebook","mdi:ruler","mdi:calculator","mdi:microscope","mdi:flask",
      "mdi:atom","mdi:lightbulb","mdi:file-document","mdi:library",
      "mdi:certificate","mdi:desk","mdi:draw","mdi:brain",
      "mdi:clipboard-text","mdi:ab-testing",
    ],
  },
  {
    title: "Communication",
    icons: [
      "mdi:phone","mdi:cellphone","mdi:email","mdi:message","mdi:chat",
      "mdi:bullhorn","mdi:microphone","mdi:radio","mdi:television","mdi:wifi",
      "mdi:access-point","mdi:antenna","mdi:forum","mdi:comment",
      "mdi:send","mdi:fax","mdi:headphones","mdi:speaker",
      "mdi:video","mdi:message-text",
    ],
  },
  {
    title: "Analytics",
    icons: [
      "mdi:chart-bar","mdi:chart-line","mdi:chart-pie","mdi:chart-areaspline","mdi:poll",
      "mdi:finance","mdi:trending-up","mdi:trending-down","mdi:table","mdi:database",
      "mdi:file-chart","mdi:clipboard-data","mdi:calendar","mdi:percent",
      "mdi:sigma","mdi:calculator","mdi:cash-multiple","mdi:target",
      "mdi:gauge","mdi:magnify",
    ],
  },
  {
    title: "Security",
    icons: [
      "mdi:lock","mdi:lock-open","mdi:shield","mdi:shield-check","mdi:key",
      "mdi:fingerprint","mdi:eye-off","mdi:security","mdi:police-badge",
      "mdi:alarm-light","mdi:cctv","mdi:safe","mdi:incognito",
      "mdi:account-lock","mdi:file-lock","mdi:folder-lock",
      "mdi:door-closed-lock","mdi:alert-octagon","mdi:firewall","mdi:shield-alert",
    ],
  },
  {
    title: "Weather",
    icons: [
      "mdi:white-balance-sunny","mdi:weather-cloudy","mdi:weather-rainy",
      "mdi:weather-pouring","mdi:weather-lightning","mdi:weather-snowy",
      "mdi:weather-fog","mdi:weather-windy","mdi:weather-hail",
      "mdi:weather-hurricane","mdi:thermometer","mdi:water-percent",
      "mdi:umbrella","mdi:snowflake","mdi:cloud","mdi:cloud-outline",
      "mdi:moon-full","mdi:star","mdi:weather-sunset","mdi:rainbow",
    ],
  },
  {
    title: "Food & Drink",
    icons: [
      "mdi:food","mdi:food-apple","mdi:hamburger","mdi:pizza","mdi:coffee",
      "mdi:cup","mdi:bottle-soda","mdi:glass-cocktail","mdi:bread-slice",
      "mdi:cheese","mdi:cake","mdi:ice-cream","mdi:noodles",
      "mdi:rice","mdi:egg","mdi:fish","mdi:carrot",
      "mdi:fruit-grapes","mdi:silverware","mdi:chef-hat",
    ],
  },
  {
    title: "Tools & Building",
    icons: [
      "mdi:hammer","mdi:wrench","mdi:screwdriver","mdi:tools","mdi:toolbox",
      "mdi:cog","mdi:nut","mdi:bolt","mdi:saw-blade","mdi:ladder",
      "mdi:shovel","mdi:pickaxe","mdi:drill","mdi:tape-measure",
      "mdi:ruler-square","mdi:construction","mdi:crane",
      "mdi:home-roof","mdi:wall","mdi:hard-hat",
    ],
  },
  {
    title: "Commerce",
    icons: [
      "mdi:cart","mdi:shopping","mdi:shopping-outline","mdi:cash",
      "mdi:cash-multiple","mdi:credit-card","mdi:bank","mdi:store",
      "mdi:tag","mdi:receipt","mdi:package-variant","mdi:truck",
      "mdi:barcode","mdi:qrcode","mdi:wallet","mdi:currency-usd",
      "mdi:currency-inr","mdi:diamond","mdi:briefcase","mdi:handshake",
    ],
  },
  {
    title: "Arrows",
    icons: [
      "mdi:arrow-left","mdi:arrow-right","mdi:arrow-up","mdi:arrow-down",
      "mdi:arrow-top-left","mdi:arrow-top-right","mdi:arrow-bottom-left",
      "mdi:arrow-bottom-right","mdi:arrow-expand","mdi:arrow-collapse",
      "mdi:undo","mdi:redo","mdi:refresh","mdi:rotate-left",
      "mdi:rotate-right","mdi:chevron-left","mdi:chevron-right",
      "mdi:chevron-up","mdi:chevron-down","mdi:swap-horizontal",
    ],
  },
];

export const ICON_LIST: IconItem[] = iconSectionsRaw.flatMap((sec) =>
  sec.icons.map((iconName) => {
    const cleanName = iconName
      .replace(/^mdi:/, "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      id: iconName,
      name: cleanName,
      category: sec.title,
      svg: iconName,
      keywords: [cleanName.toLowerCase(), sec.title.toLowerCase(), ...iconName.split(":")],
    };
  })
);
