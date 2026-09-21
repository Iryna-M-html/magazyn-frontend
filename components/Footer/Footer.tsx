import Link from "next/link";
import css from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={css["footer"]}>
      <div className="container">
        {" "}
        <div className={css["footer-container"]}>
          <div>
            <div className={css["footer-link"]}>
              <div className={css["footer-logo"]}>
                <p className={css["text-logo"]}>E-Pharmacy</p>

                <ul className={css["nav_list"]}>
                  <li className={css["nav_list_item"]}>
                    <Link className={css["nav_list_link"]} href="/">
                      Home
                    </Link>
                  </li>

                  <li className={css["nav_list_item"]}>
                    <Link
                      className={css["nav_list_link"]}
                      href="/medicine-store"
                    >
                      Medicine store
                    </Link>
                  </li>
                  <li className={css["nav_list_item"]}>
                    <Link className={css["nav_list_link"]} href="/medicine">
                      Medicine
                    </Link>
                  </li>
                </ul>
                <ul className={css["social_links"]}>
                  <li>
                    <Link
                      href="https://www.facebook.com"
                      target="_blank"
                      aria-label="facebook"
                      className={css["social_link_item"]}
                    >
                      <svg className={css["social_icon"]} aria-hidden="true">
                        <use href="/sprite.svg#facebook"></use>
                      </svg>
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="https://www.instagram.com"
                      target="_blank"
                      aria-label="instagram"
                      className={css["social_link_item"]}
                    >
                      <svg className={css["social_icon"]} aria-hidden="true">
                        <use href="/sprite.svg#instagram"></use>
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.youtube.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="youtube"
                      className={css["social_link_item"]}
                    >
                      <svg className={css["social_icon"]} aria-hidden="true">
                        <use href="/sprite.svg#youtube"></use>
                      </svg>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <p className={css["footer-text"]}>
              Get the medicine to help you feel better, get back to your active
              life, and enjoy every moment.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
