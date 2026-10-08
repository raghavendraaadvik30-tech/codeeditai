import type { DocumentModel } from "../store/documentModel";

import { generateWordDocx } from "./docxGeneratorService";


export interface DocumentMeta {

  id: string;

  title: string;

  author: string;

  subject?: string;

  keywords?: string;

  comment?: string;

  savedAt: number;

  version: number;

}


export interface SavedDocument {

  meta: DocumentMeta;

  html: string;

}


export interface DocumentCounts {

  words: number;

  characters: number;

  charactersNoSpaces: number;

  paragraphs: number;

  pages: number;

}


export interface OutlineItem {

  id: string;

  level: number;

  text: string;

  el: HTMLElement;

}


/* ============================================================

   Storage

\============================================================ */


const STORAGE_PREFIX = "editor_document:";

const META_KEY = "editor_document_current";


/* ============================================================

   Page Dimensions

\============================================================ */


export const PAGE_WIDTH_PX = 816;


export const PAGE_HEIGHT_PX = 1056;


/* ============================================================

   Service

\============================================================ */


export const documentService = {


  /* ==========================================================

     Compute Counts

  ========================================================== */


  computeCounts(

    editor: HTMLElement | null,

    contentHeight = 0

  ): DocumentCounts {


    if (!editor) {

      return {

        words: 0,

        characters: 0,

        charactersNoSpaces: 0,

        paragraphs: 0,

        pages: 1,

      };

    }


    const cleanText = (editor.innerText ?? "")

      .replace(/[\u200B\u200C\u200D\uFEFF\u00AD]/g, "")

      .replace(/\r?\n/g, " ");


    const trimmed = cleanText.trim();


    const words = trimmed

      ? trimmed.split(/\s+/).filter(Boolean).length

      : 0;


    const charactersNoSpaces = trimmed.replace(/\s+/g, "").length;

    const characters = trimmed ? cleanText.replace(/\s+$/, "").length : 0;


    const paragraphs = trimmed

      ? Math.max(

          1,

          Array.from(editor.querySelectorAll("p,h1,h2,h3,h4,h5,h6,li")).filter(

            (el) => (el.textContent || "").trim().length > 0

          ).length

        )

      : 0;


    const height =

      contentHeight ||

      editor.scrollHeight ||

      0;


    const pages = Math.max(

      1,

      Math.ceil(height / PAGE_HEIGHT_PX)

    );


    return {

      words,

      characters,

      charactersNoSpaces,

      paragraphs,

      pages,

    };

  },


  /* ==========================================================

     Build Outline

  ========================================================== */


  buildOutline(

    editor: HTMLElement | null

  ): OutlineItem[] {


    if (!editor) {

      return [];

    }


    const headings = Array.from(

      editor.querySelectorAll(

        "h1,h2,h3,h4,h5,h6"

      )

    ) as HTMLElement[];


    return headings.map((heading, index) => {


      if (!heading.id) {

        heading.id =

          "heading\_" +

          index +

          "\_" +

          Math.random()

            .toString(36)

            .substring(2, 7);

      }


      return {

        id: heading.id,


        level: Number(

          heading.tagName.substring(1)

        ),


        text:

          heading.innerText.trim() ||

          "(Untitled)",


        el: heading,

      };

    });

  },

      /* ==========================================================
     Recalculate Heading Numbering

     Displays hierarchical numbering without changing the actual
     heading text:
       1 Heading-1
       1.1 Heading-2
       1.1.1 Heading-3
       1.1.1.1 Heading-4
  ========================================================== */

  recalculateDOMNumbering(editor?: HTMLElement | null): void {
    const target =
      editor ??
      (document.querySelector(
        '[contenteditable="true"]'
      ) as HTMLElement | null);

    if (!target) return;

    const headings = Array.from(
      target.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ) as HTMLElement[];

    const counters = [0, 0, 0, 0, 0, 0];

    headings.forEach((heading) => {
      const level = Number(heading.tagName.substring(1));
      if (level < 1 || level > 6) return;

      counters[level - 1] += 1;

      // Reset deeper levels whenever a parent heading changes.
      for (let i = level; i < counters.length; i += 1) {
        counters[i] = 0;
      }

      // Make numbering stable if the document starts at H2/H3/etc.
      for (let i = 0; i < level - 1; i += 1) {
        if (counters[i] === 0) counters[i] = 1;
      }

      heading.dataset.headingNumber = counters
        .slice(0, level)
        .filter((value) => value > 0)
        .join('.');
    });

    // The number is rendered visually with ::before, so the heading's
    // actual text remains unchanged for save/search/outline/export.
    const styleId = 'editor-heading-numbering-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        [data-heading-number]::before {
          content: attr(data-heading-number) "  ";
          display: inline-block;
          margin-right: 0.15em;
          font-variant-numeric: tabular-nums;
        }
      `;
      document.head.appendChild(style);
    }
  },

/* ==========================================================

     Save Document

  ========================================================== */


  save(

    meta: DocumentMeta,

    html: string

  ): SavedDocument {

    const document: SavedDocument = {

      meta,

      html,

    };


    localStorage.setItem(

      STORAGE_PREFIX + meta.id,

      JSON.stringify(document)

    );


    localStorage.setItem(

      META_KEY,

      meta.id

    );


    return document;

  },


  /* ==========================================================

     Load Document

  ========================================================== */


  load(

    id: string

  ): SavedDocument | null {


    const raw = localStorage.getItem(

      STORAGE_PREFIX + id

    );


    if (!raw) {

      return null;

    }


    try {

      return JSON.parse(raw) as SavedDocument;

    } catch {

      return null;

    }

  },


  /* ==========================================================

     List Saved Documents

  ========================================================== */


  listSaved(): DocumentMeta[] {


    const documents: DocumentMeta[] = [];


    for (

      let i = 0;

      i < localStorage.length;

      i++

    ) {


      const key = localStorage.key(i);


      if (

        !key ||

        !key.startsWith(STORAGE_PREFIX)

      ) {

        continue;

      }


      try {


        const raw =

          localStorage.getItem(key);


        if (!raw) continue;


        const saved =

          JSON.parse(raw) as SavedDocument;


        documents.push(saved.meta);


      } catch {

        // ignore invalid document

      }

    }


    return documents.sort(

      (a, b) => b.savedAt - a.savedAt

    );

  },


  /* ==========================================================

     Current Document

  ========================================================== */


  currentId(): string | null {


    return localStorage.getItem(

      META_KEY

    );

  },


  /* ==========================================================

     Export HTML

  ========================================================== */


  exportHTML(

    meta: DocumentMeta,

    html: string

  ): Blob {


    const documentHtml = `<!DOCTYPE html>

<html lang="en">


<head>


<meta charset="UTF-8">


<title>${escapeHtml(meta.title)}</title>


<meta name="author"

content="${escapeHtml(meta.author)}">


<meta name="description"

content="${escapeHtml(meta.subject ?? "")}">


<meta name="keywords"

content="${escapeHtml(meta.keywords ?? "")}">


<style>


body{

font-family:Calibri,Arial,sans-serif;

margin:40px;

font-size:12pt;

line-height:1.6;

}


table{

border-collapse:collapse;

}


img{

max-width:100%;

}


.page-break{

page-break-after:always;

}


</style>


</head>


<body>


${html}


</body>


</html>`;


    return new Blob(

      [documentHtml],

      {

        type: "text/html",

      }

    );

  },


  /* ==========================================================

     Export DOCX (OpenXML Word Document)

  ========================================================== */


  async exportDOCX(

    modelOrMeta: DocumentModel | DocumentMeta,

    htmlOrOptions?: string | { tableAutoFitMode?: "fixed" | "contents" | "window"; exportMarkupMode?: "markup" | "final" | "original" }

  ): Promise<Blob> {

    if ("pages" in modelOrMeta && "sections" in modelOrMeta) {

      return generateWordDocx(

        modelOrMeta,

        typeof htmlOrOptions === "object" ? htmlOrOptions : undefined

      );

    }


    const fallbackModel: DocumentModel = {

      id: modelOrMeta.id,

      title: modelOrMeta.title,

      pages: [{ id: "p1", sectionId: "s1" }],

      sections: [{

        id: "s1",

        header: "",

        footer: "",

        differentFirstPage: false,

        differentOddEven: false,

        firstHeader: "",

        firstFooter: "",

        evenHeader: "",

        evenFooter: "",

        showPageNumbers: false,

      }],

      pageHtml: { p1: typeof htmlOrOptions === "string" ? htmlOrOptions : "<p></p>" },

      styleOverrides: {},

    };

    return generateWordDocx(fallbackModel);

  },


  /* ==========================================================

     Download File

  ========================================================== */


  download(

    blob: Blob,

    filename: string

  ) {


    const url =

      URL.createObjectURL(blob);


    const link =

      document.createElement("a");


    link.href = url;


    link.download = filename;


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    setTimeout(() => {

      URL.revokeObjectURL(url);

    }, 1000);

  },

    /* ==========================================================

     Clear Search Marks

  ========================================================== */


  clearSearchMarks(editor: HTMLElement | null) {

    if (!editor) return;


    editor

      .querySelectorAll("mark[data-search]")

      .forEach((mark) => {

        const parent = mark.parentNode;


        if (!parent) return;


        while (mark.firstChild) {

          parent.insertBefore(

            mark.firstChild,

            mark

          );

        }


        parent.removeChild(mark);

        parent.normalize();

      });

  },


  /* ==========================================================

     Highlight Search Matches

  ========================================================== */


  highlightMatches(

    editor: HTMLElement | null,

    query: string,

    caseSensitive = false

  ): HTMLElement[] {


    this.clearSearchMarks(editor);


    if (!editor || !query.trim()) {

      return [];

    }


    const escaped = query.replace(

      /[.*+?^${}()|[\]\\]/g,

      "\\\\$&"

    );


    const regex = new RegExp(

      escaped,

      caseSensitive ? "g" : "gi"

    );


    const walker = document.createTreeWalker(

      editor,

      NodeFilter.SHOW_TEXT

    );


    const marks: HTMLElement[] = [];


    let node: Node | null;


    while ((node = walker.nextNode())) {


      const textNode = node as Text;


      const value = textNode.nodeValue ?? "";


      if (!regex.test(value)) {

        regex.lastIndex = 0;

        continue;

      }


      regex.lastIndex = 0;


      const fragment =

        document.createDocumentFragment();


      let lastIndex = 0;


      let match: RegExpExecArray | null;


      while ((match = regex.exec(value))) {


        if (match.index > lastIndex) {

          fragment.appendChild(

            document.createTextNode(

              value.substring(

                lastIndex,

                match.index

              )

            )

          );

        }


        const mark =

          document.createElement("mark");


        mark.dataset.search = "1";


        mark.textContent = match[0];


        mark.style.background =

          "#fde68a";


        mark.style.color =

          "#78350f";


        fragment.appendChild(mark);


        marks.push(mark);


        lastIndex =

          match.index + match[0].length;

      }


      if (lastIndex < value.length) {

        fragment.appendChild(

          document.createTextNode(

            value.substring(lastIndex)

          )

        );

      }


      textNode.parentNode?.replaceChild(

        fragment,

        textNode

      );

    }


    return marks;

  },


  /* ==========================================================

     Replace Current Match

  ========================================================== */


  replaceCurrent(

    mark: HTMLElement | null,

    replacement: string

  ) {


    if (!mark) return;


    const text =

      document.createTextNode(replacement);


    mark.parentNode?.replaceChild(

      text,

      mark

    );

  },


  /* ==========================================================

     Replace All Matches

  ========================================================== */


  replaceAll(

    editor: HTMLElement | null,

    replacement: string

  ) {


    if (!editor) return 0;


    const marks = Array.from(

      editor.querySelectorAll(

        "mark[data-search]"

      )

    ) as HTMLElement[];


    marks.forEach((mark) =>

      this.replaceCurrent(

        mark,

        replacement

      )

    );


    return marks.length;

  },


  /* ==========================================================

     Bookmarks

  ========================================================== */


  listBookmarks(

    editor: HTMLElement | null

  ) {


    if (!editor) return [];


    return Array.from(

      editor.querySelectorAll(

        "a[data-bookmark]"

      )

    ).map((anchor) => ({

      id: (anchor as HTMLElement).id,


      name:

        anchor.getAttribute(

          "data-bookmark"

        ) ??

        (anchor as HTMLElement).id,


      el: anchor as HTMLElement,

    }));

  },


  deleteBookmark(

    editor: HTMLElement | null,

    id: string

  ) {


    editor

      ?.querySelector(

        `a[data-bookmark]#${CSS.escape(id)}`

      )

      ?.remove();

  },


  /* ==========================================================

     Insert Helpers

  ========================================================== */


  pageBreakHTML() {

    return `

<div class="page-break"

contenteditable="false"

data-page-break="1">


</div>


<p><br/></p>

`;

  },


  sectionBreakHTML(

    label = "Section"

  ) {


    return `

<div class="section-break"

contenteditable="false"

data-section-break="1">


${escapeHtml(label)} Break


</div>


<p><br/></p>

`;

  },


  bookmarkHTML(

    name: string

  ) {


    const id =

      "bookmark\_" +

      Math.random()

        .toString(36)

        .substring(2, 8);


    return `

<a

id="${id}"

data-bookmark="${escapeHtml(name)}"

class="bookmark-anchor">


🔖 ${escapeHtml(name)}


</a>

`;

  },


};


/* ==========================================================

   HTML Escape Helper

\========================================================== */


function escapeHtml(

  value: string

): string {


  return value.replace(

    /[&<>"']/g,

    (character) => {


      const map: Record<

        string,

        string

      > = {


        "&": "&amp;",


        "<": "&lt;",


        ">": "&gt;",


        '"': "&quot;",


        "'": "&#39;",

      };


      return (

        map[character] ??

        character

      );

    }

  );

}
