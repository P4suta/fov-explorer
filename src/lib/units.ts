/**
 * Branded numeric units. The brands exist purely at the type level (`unique
 * symbol` intersections) so there is zero runtime cost — `Mm` is a `number`
 * once compiled, but `tan(mm(50))` fails to typecheck because `Mm` is not
 * `Rad`. This is the optics module's primary defence against the classic
 * "I passed degrees to Math.tan" bug.
 */

declare const __mm: unique symbol;
declare const __deg: unique symbol;
declare const __rad: unique symbol;

export type Mm = number & { readonly [__mm]: undefined };
export type Deg = number & { readonly [__deg]: undefined };
export type Rad = number & { readonly [__rad]: undefined };

export const mm = (n: number): Mm => n as Mm;
export const deg = (n: number): Deg => n as Deg;
export const rad = (n: number): Rad => n as Rad;

const PI = Math.PI;

export const degToRad = (d: Deg): Rad => (((d as number) * PI) / 180) as Rad;
export const radToDeg = (r: Rad): Deg => (((r as number) * 180) / PI) as Deg;
