"use client";
import React from "react";
import Image from "next/image";
import styles from "./Hero.module.css";

export const Hero: React.FC = () => {
  return (
    <section className={styles["hero"]}>
      <div className="container">
        <div className={styles["heroContainer"]}>
          <div className={styles["textContent"]}>
            <h1 className={styles["title"]}>
              Your medication <br /> delivered
            </h1>
            <p className={styles["subtitle"]}>
              Say goodbye to all your healthcare worries with us
            </p>
          </div>
          <div className={styles["imageContent"]}>
            <Image
              src="/img/Image_m22ouhm22ouhm22o.png"
              alt="Medications bottle and pills"
              width={500}
              height={400}
              priority
              className={styles["medsImage"]}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
