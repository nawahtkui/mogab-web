import type {
  Block,
  BlockProps,
  FeatureItem,
  PricingPlan,
  GalleryItem,
  FaqItem
} from "../../blocks/block.types";

export type RenderedBlock = {
  id: string;
  type: string;
  html: string;
};

export type BlockRenderer = (
  block: Block
) => RenderedBlock;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value: unknown): string {
  return escapeHtml(value);
}

function renderHero(props: BlockProps): string {
  return `
<section data-mogab-block="hero">
  <div class="mogab-hero">
    ${
      props.title
        ? `<h1>${escapeHtml(props.title)}</h1>`
        : ""
    }

    ${
      props.subtitle
        ? `<p>${escapeHtml(props.subtitle)}</p>`
        : ""
    }

    ${
      props.button
        ? `
          <a
            href="${escapeAttribute(props.buttonLink || "#")}"
            class="mogab-button"
          >
            ${escapeHtml(props.button)}
          </a>
        `
        : ""
    }

    ${
      props.image
        ? `
          <img
            src="${escapeAttribute(props.image)}"
            alt="${escapeAttribute(props.title || "Hero image")}"
            class="mogab-hero-image"
          />
        `
        : ""
    }
  </div>
</section>
`.trim();
}

function renderFeatures(props: BlockProps): string {
  const items = Array.isArray(props.items)
    ? props.items as FeatureItem[]
    : [];

  return `
<section data-mogab-block="features">
  <div class="mogab-features">

    ${
      props.title
        ? `<h2>${escapeHtml(props.title)}</h2>`
        : ""
    }

    ${
      props.subtitle
        ? `<p>${escapeHtml(props.subtitle)}</p>`
        : ""
    }

    <div class="mogab-feature-list">

      ${items.map((item) => `
        <article class="mogab-feature">

          ${
            item.icon
              ? `<div class="mogab-feature-icon">${escapeHtml(item.icon)}</div>`
              : ""
          }

          <h3>
            ${escapeHtml(item.title)}
          </h3>

          ${
            item.description
              ? `<p>${escapeHtml(item.description)}</p>`
              : ""
          }

          ${
            item.image
              ? `
                <img
                  src="${escapeAttribute(item.image)}"
                  alt="${escapeAttribute(item.title)}"
                  class="mogab-feature-image"
                />
              `
              : ""
          }

          ${
            item.link
              ? `
                <a
                  href="${escapeAttribute(item.link)}"
                  class="mogab-feature-link"
                >
                  Learn more
                </a>
              `
              : ""
          }

        </article>
      `).join("")}

    </div>
  </div>
</section>
`.trim();
}

function renderPricing(props: BlockProps): string {
  const plans = Array.isArray(props.plans)
    ? props.plans as PricingPlan[]
    : [];

  return `
<section data-mogab-block="pricing">
  <div class="mogab-pricing">

    ${
      props.title
        ? `<h2>${escapeHtml(props.title)}</h2>`
        : ""
    }

    ${
      props.subtitle
        ? `<p>${escapeHtml(props.subtitle)}</p>`
        : ""
    }

    <div class="mogab-pricing-list">

      ${plans.map((plan) => `
        <article
          class="mogab-plan${plan.highlighted ? " mogab-plan-highlighted" : ""}"
        >

          <h3>
            ${escapeHtml(plan.name)}
          </h3>

          ${
            plan.description
              ? `<p>${escapeHtml(plan.description)}</p>`
              : ""
          }

          ${
            plan.price
              ? `
                <div class="mogab-plan-price">
                  ${escapeHtml(plan.price)}

                  ${
                    plan.period
                      ? `<small>/${escapeHtml(plan.period)}</small>`
                      : ""
                  }
                </div>
              `
              : ""
          }

          ${
            Array.isArray(plan.features)
              ? `
                <ul>
                  ${plan.features
                    .map(feature =>
                      `<li>${escapeHtml(feature)}</li>`
                    )
                    .join("")}
                </ul>
              `
              : ""
          }

          ${
            plan.button
              ? `
                <a
                  href="${escapeAttribute(plan.buttonLink || "#")}"
                  class="mogab-button"
                >
                  ${escapeHtml(plan.button)}
                </a>
              `
              : ""
          }

        </article>
      `).join("")}

    </div>
  </div>
</section>
`.trim();
}

function renderAbout(props: BlockProps): string {
  const alignment =
    typeof props.alignment === "string"
      ? props.alignment
      : "left";

  return `
<section data-mogab-block="about">
  <div
    class="mogab-about"
    style="text-align:${escapeAttribute(alignment)};"
  >

    ${
      props.title
        ? `<h2>${escapeHtml(props.title)}</h2>`
        : "<h2>About</h2>"
    }

    ${
      props.text
        ? `<p>${escapeHtml(props.text)}</p>`
        : ""
    }

    ${
      props.image
        ? `
          <img
            src="${escapeAttribute(props.image)}"
            alt="${escapeAttribute(props.title || "About")}"
            class="mogab-about-image"
          />
        `
        : ""
    }

  </div>
</section>
`.trim();
}

function renderContact(props: BlockProps): string {
  return `
<section data-mogab-block="contact">
  <div class="mogab-contact">

    <h2>
      ${escapeHtml(props.title || "Contact")}
    </h2>

    ${
      props.description
        ? `<p>${escapeHtml(props.description)}</p>`
        : ""
    }

    ${
      props.email
        ? `<p>Email: ${escapeHtml(props.email)}</p>`
        : ""
    }

    ${
      props.phone
        ? `<p>Phone: ${escapeHtml(props.phone)}</p>`
        : ""
    }

    ${
      props.address
        ? `<p>Address: ${escapeHtml(props.address)}</p>`
        : ""
    }

    ${
      props.button
        ? `
          <a
            href="${escapeAttribute(props.buttonLink || "#")}"
            class="mogab-button"
          >
            ${escapeHtml(props.button)}
          </a>
        `
        : ""
    }

  </div>
</section>
`.trim();
}

function renderGallery(props: BlockProps): string {
  const images = Array.isArray(props.images)
    ? props.images as GalleryItem[]
    : [];

  return `
<section data-mogab-block="gallery">
  <div class="mogab-gallery">

    ${
      props.title
        ? `<h2>${escapeHtml(props.title)}</h2>`
        : ""
    }

    ${
      props.subtitle
        ? `<p>${escapeHtml(props.subtitle)}</p>`
        : ""
    }

    <div class="mogab-gallery-grid">

      ${images.map((item) => `
        <figure class="mogab-gallery-item">

          <img
            src="${escapeAttribute(item.image)}"
            alt="${escapeAttribute(item.alt || item.title || "")}"
          />

          ${
            item.title || item.description
              ? `
                <figcaption>

                  ${
                    item.title
                      ? `<strong>${escapeHtml(item.title)}</strong>`
                      : ""
                  }

                  ${
                    item.description
                      ? `<p>${escapeHtml(item.description)}</p>`
                      : ""
                  }

                </figcaption>
              `
              : ""
          }

        </figure>
      `).join("")}

    </div>
  </div>
</section>
`.trim();
}

function renderFaq(props: BlockProps): string {
  const questions = Array.isArray(props.questions)
    ? props.questions as FaqItem[]
    : [];

  return `
<section data-mogab-block="faq">
  <div class="mogab-faq">

    ${
      props.title
        ? `<h2>${escapeHtml(props.title)}</h2>`
        : "<h2>Frequently Asked Questions</h2>"
    }

    ${
      props.subtitle
        ? `<p>${escapeHtml(props.subtitle)}</p>`
        : ""
    }

    <div class="mogab-faq-list">

      ${questions.map((item) => `
        <details class="mogab-faq-item">

          <summary>
            ${escapeHtml(item.question)}
          </summary>

          <p>
            ${escapeHtml(item.answer)}
          </p>

        </details>
      `).join("")}

    </div>
  </div>
</section>
`.trim();
}

function renderCta(props: BlockProps): string {
  const text =
    props.text ||
    props.title ||
    "Call to Action";

  return `
<section data-mogab-block="cta">
  <div class="mogab-cta">

    ${
      props.title
        ? `<h2>${escapeHtml(props.title)}</h2>`
        : ""
    }

    ${
      props.text
        ? `<p>${escapeHtml(props.text)}</p>`
        : ""
    }

    <a
      href="${escapeAttribute(props.buttonLink || "#")}"
      class="mogab-button"
    >
      ${escapeHtml(props.button || text)}
    </a>

  </div>
</section>
`.trim();
}

export function renderBlock(
  block: Block
): RenderedBlock {

  let html: string;

  switch (block.type) {

    case "hero":
      html = renderHero(block.props);
      break;

    case "features":
      html = renderFeatures(block.props);
      break;

    case "pricing":
      html = renderPricing(block.props);
      break;

    case "about":
      html = renderAbout(block.props);
      break;

    case "contact":
      html = renderContact(block.props);
      break;

    case "gallery":
      html = renderGallery(block.props);
      break;

    case "faq":
      html = renderFaq(block.props);
      break;

    case "cta":
      html = renderCta(block.props);
      break;

    default:
      html = "";
  }

  return {
    id: block.id,
    type: block.type,
    html
  };
}

export function renderBlocks(
  blocks: Block[]
): RenderedBlock[] {
  return blocks.map(renderBlock);
}
