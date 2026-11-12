import content from "@/content/home.fa.json";
import { PageHero } from "@/components/shared/PageHero";
import { HomeServices } from "@/components/home/HomeServices";

export function Hero() {
  const hero = content.hero;
  return <>
    <PageHero eyebrow={hero.eyebrow}
      title={<>{hero.title[0]}<br />{hero.title[1]}<br /><span className="gradient-text">{hero.title[2]}</span></>}
      description={hero.description} image={hero.image} imageAlt={hero.imageAlt}
      note={hero.note} detail={hero.detail} coordinate={hero.coordinate}
      primary={hero.primary} secondary={hero.secondary} footnote={hero.footnote} capabilities={[]} />
    <HomeServices />
  </>;
}
