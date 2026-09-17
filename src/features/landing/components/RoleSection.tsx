interface RoleSectionProps {
  id: 'issuer' | 'owner' | 'verifier';
  label: string;
  title: string;
  points: string[];
  image: { src: string; alt: string };
  /** Owner's row is mirrored, which is what produces the zig-zag. */
  reverse?: boolean;
}

/**
 * SECTIONS 3-5 - one per role. The standalone page repeated this block three
 * times; the only differences were the copy, the image and the reversed grid.
 */
export function RoleSection({ id, label, title, points, image, reverse = false }: RoleSectionProps) {
  return (
    <section className="role-section" id={id}>
      <div className="container">
        <div className={reverse ? 'role-grid role-grid-reverse' : 'role-grid'}>
          <div className="role-text-col">
            <span className="role-label">{label}</span>
            <h2 className="role-title">{title}</h2>
            <div className="role-points">
              {points.map((point) => (
                <div className="role-card" key={point}>
                  <p className="role-card-text">{point}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="role-image-col">
            <div className="role-image-wrap">
              <img
                src={image.src}
                alt={image.alt}
                width="1448"
                height="1086"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="role-illustration"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
