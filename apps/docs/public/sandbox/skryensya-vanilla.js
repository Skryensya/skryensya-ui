//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, n = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
};
//#endregion
//#region packages/core/src/icon.ts
function r({ icon: e, dataIcon: t, size: n, label: r, className: a }) {
	let o = Object.entries(e.attrs ?? {}).filter(([e]) => !i.has(e.toLowerCase())), s = [];
	return t !== void 0 && s.push(["data-icon", t]), s.push(["class", a ? `sk-icon ${a}` : "sk-icon"]), n && s.push(["data-size", n]), s.push(["viewBox", e.viewBox]), r == null ? s.push(["aria-hidden", "true"]) : s.push(["role", "img"], ["aria-label", r]), s.push(["focusable", "false"]), {
		presentation: o,
		box: s,
		body: e.body
	};
}
var i, a = t((() => {
	i = /* @__PURE__ */ new Set([
		"class",
		"viewbox",
		"data-icon",
		"data-size",
		"aria-hidden",
		"aria-label",
		"role",
		"focusable"
	]);
}));
//#endregion
//#region packages/vanilla/src/icon.ts
function o(e, t) {
	p = t;
	let n = 0;
	for (let r of c(e)) {
		let e = r.getAttribute("data-sk-icon");
		if (!e) continue;
		let i = t[e];
		if (!i) {
			u(e);
			continue;
		}
		r.replaceWith(l(e, i, r)), n += 1;
	}
	return n;
}
function s(e) {
	return p ? o(e, p) : 0;
}
function c(e) {
	let t = Array.from(e.querySelectorAll(f));
	return e instanceof Element && e.matches(f) && t.unshift(e), t;
}
function l(e, t, n) {
	let i = document.createElementNS(d, "svg"), a = Array.from(n.classList).filter((e) => e && e !== "sk-icon"), o = n.getAttribute("data-sk-icon-size"), s = n.getAttribute("data-sk-icon-label"), { presentation: c, box: l, body: u } = r({
		icon: t,
		dataIcon: e,
		className: a.length ? a.join(" ") : void 0,
		size: o || void 0,
		label: s ?? void 0
	});
	for (let [e, t] of c) i.setAttribute(e, t);
	for (let e of Array.from(n.attributes)) {
		let t = e.name.toLowerCase();
		m.has(t) || h.has(t) || i.setAttribute(e.name, e.value);
	}
	for (let [e, t] of l) i.setAttribute(e, t);
	return i.insertAdjacentHTML("afterbegin", u), i;
}
function u(e) {
	g.has(e) || (g.add(e), console.warn(`[ds] mountIcons: el set enlazado no cubre "${e}". Si es un rol del sistema, revisa el nombre; si es geometría del proyecto, escribe el <svg> a mano (ADR-15) en vez de data-sk-icon.`));
}
var d, f, p, m, h, g, _ = t((() => {
	a(), d = "http://www.w3.org/2000/svg", f = "[data-sk-icon]", m = /* @__PURE__ */ new Set([
		"data-sk-icon",
		"data-sk-icon-size",
		"data-sk-icon-label"
	]), h = /* @__PURE__ */ new Set([
		"class",
		"viewbox",
		"aria-hidden",
		"role",
		"aria-label",
		"data-size",
		"focusable"
	]), g = /* @__PURE__ */ new Set();
})), v, y, b = t((() => {
	v = {
		root: "sk-button",
		interactive: "sk-interactive"
	}, y = {
		id: "button",
		css: "@skryensya/core/components/button.css",
		parts: v,
		options: {
			variant: {
				type: "enum",
				values: [
					"neutral",
					"subtle",
					"translucent",
					"primary",
					"danger",
					"ghost"
				],
				default: "neutral",
				attr: "data-variant"
			},
			size: {
				type: "enum",
				values: [
					"sm",
					"md",
					"lg"
				],
				default: "md",
				attr: "data-size"
			},
			iconOnly: {
				type: "boolean",
				default: !1,
				attr: "data-icon-only",
				trueValue: ""
			},
			weldStart: {
				type: "boolean",
				default: !1,
				attr: "data-weld-start",
				trueValue: ""
			},
			weldEnd: {
				type: "boolean",
				default: !1,
				attr: "data-weld-end",
				trueValue: ""
			},
			href: {
				type: "string",
				attr: "href"
			},
			disabled: {
				type: "boolean",
				default: !1,
				attr: "disabled",
				trueValue: ""
			}
		},
		signatures: {
			"Button.action": {
				intent: [
					"action",
					"submit",
					"destructive-action"
				],
				host: {
					element: "button",
					when: { href: "absent" }
				},
				options: [
					"variant",
					"size",
					"iconOnly",
					"weldStart",
					"weldEnd",
					"disabled"
				],
				slots: { children: {
					accepts: "node",
					required: !0
				} },
				template: {
					element: "button",
					part: "root",
					also: [v.interactive],
					host: !0,
					attrsWhen: [{
						option: "disabled",
						equals: "true",
						attrs: { "aria-disabled": "true" }
					}],
					slot: "children"
				},
				react: {
					from: "@skryensya/react/button",
					name: "Button"
				},
				mount: "data-sk-button"
			},
			"Button.navigation": {
				intent: ["navigation", "single-destination"],
				host: {
					element: "a",
					when: { href: "present" }
				},
				options: [
					"variant",
					"size",
					"iconOnly",
					"weldStart",
					"weldEnd",
					"href"
				],
				requires: ["href"],
				forbids: ["disabled", "type"],
				slots: { children: {
					accepts: "node",
					required: !0
				} },
				template: {
					element: "a",
					part: "root",
					also: [v.interactive],
					host: !0,
					slot: "children"
				},
				react: {
					from: "@skryensya/react/button",
					name: "Button"
				},
				mount: "data-sk-button"
			}
		},
		a11y: [{
			when: { iconOnly: !0 },
			requiresOneOf: ["aria-label", "aria-labelledby"],
			because: "A square control shows no text, so the host owns the accessible name; the icon child is decorative."
		}]
	};
}));
//#endregion
//#region packages/vanilla/src/runtime/apply.ts
function x(e, t) {
	for (let [n, r] of Object.entries(t)) r === !1 || r == null ? e.removeAttribute(n) : r === !0 ? e.setAttribute(n, "") : e.setAttribute(n, String(r));
}
function S(e, t) {
	let n = [];
	for (let [r, i] of Object.entries(t)) e.addEventListener(r, i), n.push(() => e.removeEventListener(r, i));
	return () => {
		for (let e of n) e();
	};
}
function C(e) {
	return e.split(";").map((e) => {
		let t = e.indexOf(":");
		if (t < 0) return null;
		let n = e.slice(0, t).trim(), r = e.slice(t + 1).trim();
		return n ? [n, r] : null;
	}).filter((e) => e !== null);
}
function w(e, t) {
	if (t == null) return;
	let n = typeof t == "string" ? C(t) : typeof t == "object" ? Object.entries(t).filter(([, e]) => e != null).map(([e, t]) => [re(e), String(t)]) : [], r = te.get(e), i = /* @__PURE__ */ new Set();
	for (let [t, r] of n) e.style.setProperty(t, r), i.add(t);
	if (r) for (let t of r) i.has(t) || e.style.removeProperty(t);
	te.set(e, i);
}
function T(e, t, n = {}) {
	let r = n.style !== !1, i = /* @__PURE__ */ new Set(), a = ne.get(e);
	for (let n in t) {
		let o = t[n];
		if (!(n === "class" || n === "className") && typeof o != "function") {
			if (n === "style") {
				r && w(e, o);
				continue;
			}
			if (o === !1 || o == null) {
				o === !1 && n.startsWith("aria-") ? (e.setAttribute(n, "false"), i.add(n)) : (o === !1 || a?.has(n)) && e.removeAttribute(n);
				continue;
			}
			if (o === !0) {
				n.startsWith("aria-") ? e.setAttribute(n, "true") : O.has(n) ? e.setAttribute(n, "") : e.setAttribute(n, "true"), i.add(n);
				continue;
			}
			e.setAttribute(n, String(o)), i.add(n);
		}
	}
	if (a) for (let t of a) i.has(t) || e.removeAttribute(t);
	ne.set(e, i);
}
function E(e, ...t) {
	e.classList.add(...t);
}
function D(e, t) {
	let n = t(), r = [];
	for (let i in n) {
		if (!ee(i) || typeof n[i] != "function") continue;
		let a = ie(i), o = (e) => {
			let n = t()[i];
			typeof n == "function" && n(e);
		};
		e.addEventListener(a, o), r.push([a, o]);
	}
	return () => {
		for (let [t, n] of r) e.removeEventListener(t, n);
	};
}
var ee, O, te, ne, re, ie, k = t((() => {
	ee = (e) => /^on[A-Za-z]/.test(e), O = /* @__PURE__ */ new Set([
		"hidden",
		"disabled",
		"readonly",
		"required",
		"checked",
		"selected",
		"open",
		"inert"
	]), te = /* @__PURE__ */ new WeakMap(), ne = /* @__PURE__ */ new WeakMap(), re = (e) => e.startsWith("--") ? e : e.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`), ie = (e) => e.slice(2).toLowerCase();
})), ae = t((() => {})), A = t((() => {
	ae();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/shared/utils.js
function oe(e) {
	return e();
}
function se(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function ce() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var le, j, ue, de, fe, pe, me, he, ge, _e, ve, ye, M = t((() => {
	le = Array.isArray, j = Array.prototype.indexOf, ue = Array.prototype.includes, de = Array.from, fe = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, me = Object.getOwnPropertyDescriptors, he = Object.prototype, ge = Array.prototype, _e = Object.getPrototypeOf, ve = Object.isExtensible, ye = () => {};
})), be, xe, Se, Ce, we, Te, Ee, De, Oe, ke, Ae, je, Me, Ne, Pe, Fe, Ie, Le, Re, ze, Be, Ve, He, Ue, We, Ge, N = t((() => {
	be = 1 << 24, xe = 1024, Se = 2048, Ce = 4096, we = 8192, Te = 16384, Ee = 32768, De = 1 << 25, Oe = 65536, ke = 1 << 19, Ae = 1 << 20, je = 1 << 25, Me = 65536, Ne = 1 << 21, Pe = 1 << 22, Fe = 1 << 23, Ie = Symbol("$state"), Le = Symbol("legacy props"), Re = Symbol(""), ze = Symbol("attributes"), Be = Symbol("class"), Ve = Symbol("style"), He = Symbol("text"), Ue = Symbol("form reset"), We = new class extends Error {
		name = "StaleReactionError";
		message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
	}(), Ge = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
}));
function Ke(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
var qe = t((() => {
	A();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/errors.js
function Je() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function Ye(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function Xe(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function Ze() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Qe(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function $e() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function et(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function tt() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function nt() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function rt() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function it() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
var at = t((() => {
	A(), qe();
})), ot, st, ct, lt = t((() => {
	ot = {}, st = Symbol("uninitialized"), ct = "http://www.w3.org/1999/xhtml";
}));
function ut() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function dt(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function ft() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function pt() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
var mt = t((() => {
	A();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/hydration.js
function ht(e) {
	F = e;
}
function gt(e) {
	if (e === null) throw dt(), ot;
	return I = e;
}
function _t() {
	return gt(/* @__PURE__ */ Tr(I));
}
function P(e) {
	if (F) {
		if (/* @__PURE__ */ Tr(I) !== null) throw dt(), ot;
		I = e;
	}
}
function vt(e = 1) {
	if (F) {
		for (var t = e, n = I; t--;) n = /* @__PURE__ */ Tr(n);
		I = n;
	}
}
function yt(e = !0) {
	for (var t = 0, n = I;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ Tr(n);
		e && n.remove(), n = i;
	}
}
function bt(e) {
	if (!e || e.nodeType !== 8) throw dt(), ot;
	return e.data;
}
var F, I, xt = t((() => {
	N(), lt(), mt(), Rr(), F = !1;
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/reactivity/equality.js
function St(e) {
	return e === this.v;
}
function Ct(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function wt(e) {
	return !Ct(e, this.v);
}
var Tt = t((() => {}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/flags/index.js
function Et() {
	Ot = !0;
}
var Dt, Ot, kt = t((() => {
	Dt = !1, Ot = !1;
})), At = t((() => {
	M();
})), jt = t((() => {
	At(), N(), B(), W();
})), Mt = t((() => {
	A(), M(), qe();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/context.js
function Nt(e) {
	L = e;
}
function Pt(e) {
	return Rt("getContext").get(e);
}
function Ft(e, t = !1, n) {
	L = {
		p: L,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: U,
		l: Ot && !t ? {
			s: null,
			u: null,
			$: []
		} : null
	};
}
function It(e) {
	var t = L, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) Gr(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, L = t.p, e ?? {};
}
function Lt() {
	return !Ot || L !== null && L.l === null;
}
function Rt(e) {
	return L === null && Ke(e), L.c ??= new Map(zt(L) || void 0);
}
function zt(e) {
	let t = e.p;
	for (; t !== null;) {
		let e = t.c;
		if (e !== null) return e;
		t = t.p;
	}
	return null;
}
var L, Bt = t((() => {
	A(), at(), W(), B(), kt(), N(), L = null;
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/task.js
function Vt() {
	var e = Wt;
	Wt = [], se(e);
}
function Ht(e) {
	if (Wt.length === 0 && !Xn) {
		var t = Wt;
		queueMicrotask(() => {
			t === Wt && Vt();
		});
	}
	Wt.push(e);
}
function Ut() {
	for (; Wt.length > 0;) Vt();
}
var Wt, Gt = t((() => {
	M(), ir(), Wt = [];
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/error-handling.js
function Kt(e) {
	var t = U;
	if (t === null) return H.f |= Fe, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	qt(e, t);
}
function qt(e, t) {
	if (!(t !== null && t.f & 16384)) {
		for (; t !== null;) {
			if (t.f & 128) {
				if (!(t.f & 32768)) throw e;
				try {
					t.b.error(e);
					return;
				} catch (t) {
					e = t;
				}
			}
			t = t.parent;
		}
		throw e;
	}
}
var Jt = t((() => {
	A(), lt(), Rr(), N(), M(), W();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/reactivity/status.js
function Yt(e, t) {
	e.f = e.f & Zt | t;
}
function Xt(e) {
	e.f & 512 || e.deps === null ? Yt(e, xe) : Yt(e, Ce);
}
var Zt, Qt = t((() => {
	N(), Zt = ~(Se | Ce | xe);
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/reactivity/utils.js
function $t(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= Me, $t(t.deps));
}
function en(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), $t(e.deps), Yt(e, xe);
}
var tn = t((() => {
	N(), Qt();
})), nn = t((() => {
	W(), M();
})), rn = t((() => {
	M(), nn();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/reactivity/store.js
function an(e) {
	var t = sn;
	try {
		return sn = !1, [e(), sn];
	} finally {
		sn = t;
	}
}
var on, sn, cn = t((() => {
	nn(), rn(), M(), W(), B(), gr(), on = !1, sn = !1;
})), ln = t((() => {
	N(), At(), W();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/elements/misc.js
function un(e, t) {
	if (t) {
		let t = document.body;
		e.autofocus = !0, Ht(() => {
			document.activeElement === t && e.focus();
		});
	}
}
function dn() {
	fn || (fn = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[Ue]?.();
		});
	}, { capture: !0 }));
}
var fn, pn = t((() => {
	xt(), Rr(), Gt(), N(), fn = !1;
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function mn(e) {
	var t = H, n = U;
	hi(null), gi(null);
	try {
		return e();
	} finally {
		hi(t), gi(n);
	}
}
var hn = t((() => {
	B(), W(), N(), pn();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/reactivity/create-subscriber.js
function gn(e) {
	let t = 0, n = ar(0), r;
	return () => {
		Hr() && (V(n), Xr(() => (t === 0 && (r = ki(() => e(() => dr(n)))), t += 1, () => {
			Ht(() => {
				--t, t === 0 && (r?.(), r = void 0, dr(n));
			});
		})));
	};
}
var _n = t((() => {
	W(), B(), gr(), jt(), A(), Gt();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
function vn(e, t, n, r) {
	new bn(e, t, n, r);
}
var yn, bn, xn = t((() => {
	N(), lt(), Bt(), Jt(), B(), W(), xt(), Gt(), at(), mt(), A(), ir(), gr(), jt(), _n(), Rr(), tn(), yn = Oe | ke, bn = class {
		parent;
		is_pending = !1;
		transform_error;
		#e;
		#t = F ? I : null;
		#n;
		#r;
		#i;
		#a = null;
		#o = null;
		#s = null;
		#c = null;
		#l = 0;
		#u = 0;
		#d = !1;
		#f = /* @__PURE__ */ new Set();
		#p = /* @__PURE__ */ new Set();
		#m = null;
		#h = gn(() => (this.#m = ar(this.#l), () => {
			this.#m = null;
		}));
		constructor(e, t, n, r) {
			this.#e = e, this.#n = t, this.#r = (e) => {
				var t = U;
				t.b = this, t.f |= 128, n(e);
			}, this.parent = U.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Qr(() => {
				if (F) {
					let e = this.#t;
					_t();
					let t = e.data === "[!";
					if (e.data.startsWith("[?")) {
						let t = JSON.parse(e.data.slice(2));
						this.#_(t);
					} else t ? this.#v() : this.#g();
				} else this.#y();
			}, yn), F && (this.#e = I);
		}
		#g() {
			try {
				this.#a = ei(() => this.#r(this.#e));
			} catch (e) {
				this.error(e);
			}
		}
		#_(e) {
			let t = this.#n.failed;
			t && (this.#s = ei(() => {
				t(this.#e, () => e, () => () => {});
			}));
		}
		#v() {
			let e = this.#n.pending;
			e && (this.is_pending = !0, this.#o = ei(() => e(this.#e)), Ht(() => {
				var e = this.#c = document.createDocumentFragment(), t = Cr();
				e.append(t), this.#a = this.#x(() => ei(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, si(this.#o, () => {
					this.#o = null;
				}), this.#b(z));
			}));
		}
		#y() {
			try {
				if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = ei(() => {
					this.#r(this.#e);
				}), this.#u > 0) {
					var e = this.#c = document.createDocumentFragment();
					di(this.#a, e);
					let t = this.#n.pending;
					this.#o = ei(() => t(this.#e));
				} else this.#b(z);
			} catch (e) {
				this.error(e);
			}
		}
		#b(e) {
			this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
		}
		defer_effect(e) {
			en(e, this.#f, this.#p);
		}
		is_rendered() {
			return !this.is_pending && (!this.parent || this.parent.is_rendered());
		}
		has_pending_snippet() {
			return !!this.#n.pending;
		}
		#x(e) {
			var t = U, n = H, r = L;
			gi(this.#i), hi(this.#i), Nt(this.#i.ctx);
			try {
				return nr.ensure(), e();
			} catch (e) {
				return Kt(e), null;
			} finally {
				gi(t), hi(n), Nt(r);
			}
		}
		#S(e, t) {
			if (!this.has_pending_snippet()) {
				this.parent && this.parent.#S(e, t);
				return;
			}
			this.#u += e, this.#u === 0 && (this.#b(t), this.#o && si(this.#o, () => {
				this.#o = null;
			}), this.#c &&= (this.#e.before(this.#c), null));
		}
		update_pending_count(e, t) {
			this.#S(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ht(() => {
				this.#d = !1, this.#m && lr(this.#m, this.#l);
			}));
		}
		get_effect_pending() {
			return this.#h(), V(this.#m);
		}
		error(e) {
			if (!this.#n.onerror && !this.#n.failed) throw e;
			z?.is_fork ? (this.#a && z.skip_effect(this.#a), this.#o && z.skip_effect(this.#o), this.#s && z.skip_effect(this.#s), z.oncommit(() => {
				this.#C(e);
			})) : this.#C(e);
		}
		#C(e) {
			this.#a &&= (ii(this.#a), null), this.#o &&= (ii(this.#o), null), this.#s &&= (ii(this.#s), null), F && (gt(this.#t), vt(), gt(yt()));
			var t = this.#n.onerror;
			let n = this.#n.failed;
			var r = !1, i = !1;
			let a = () => {
				if (r) {
					pt();
					return;
				}
				r = !0, i && it(), this.#s !== null && si(this.#s, () => {
					this.#s = null;
				}), this.#x(() => {
					this.#y();
				});
			}, o = (e) => {
				try {
					i = !0, t?.(e, a), i = !1;
				} catch (e) {
					qt(e, this.#i && this.#i.parent);
				}
				n && (this.#s = this.#x(() => {
					try {
						return ei(() => {
							var t = U;
							t.b = this, t.f |= 128, n(this.#e, () => e, () => a);
						});
					} catch (e) {
						return qt(e, this.#i.parent), null;
					}
				}));
			};
			Ht(() => {
				var t;
				try {
					t = this.transform_error(e);
				} catch (e) {
					qt(e, this.#i && this.#i.parent);
					return;
				}
				typeof t == "object" && t && typeof t.then == "function" ? t.then(o, (e) => qt(e, this.#i && this.#i.parent)) : o(t);
			});
		}
	};
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/reactivity/async.js
function Sn(e, t, n, r) {
	let i = Lt() ? Dn : kn;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = U, c = Cn(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				qt(e, s);
			}
			wn();
		}
	}
	var d = Tn();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ On(e))).then(u).catch((e) => qt(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), wn();
	}) : f();
}
function Cn() {
	var e = U, t = H, n = L, r = z;
	return function(i = !0) {
		gi(e), hi(t), Nt(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function wn(e = !0) {
	gi(null), hi(null), Nt(null), e && z?.deactivate();
}
function Tn() {
	var e = U, t = e.b, n = z, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
var En = t((() => {
	N(), A(), Bt(), xn(), Jt(), W(), ir(), In(), B(), Gt();
}));
/*#__NO_SIDE_EFFECTS__*/
function Dn(e) {
	var t = 2 | Se;
	return U !== null && (U.f |= ke), {
		ctx: L,
		deps: null,
		effects: null,
		equals: St,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: st,
		wv: 0,
		parent: U,
		ac: null
	};
}
/*#__NO_SIDE_EFFECTS__*/
function On(e, t, n) {
	let r = U;
	r === null && Je();
	var i = void 0, a = ar(st), o = !H, s = /* @__PURE__ */ new Set();
	return Yr(() => {
		var t = U, n = ce();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== We && n.reject(e);
			}).finally(wn);
		} catch (e) {
			n.reject(e), wn();
		}
		var c = z;
		if (o) {
			if (t.f & 32768) var l = Tn();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(Fn);
			else for (let e of s.values()) e.reject(Fn);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== Fn && (c.activate(), t ? (a.f |= Fe, lr(a, t)) : (a.f & 8388608 && (a.f ^= Fe), lr(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), Ur(() => {
		for (let e of s) e.reject(Fn);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === i ? e(a) : t(i);
			}
			n.then(r, r);
		}
		t(i);
	});
}
/*#__NO_SIDE_EFFECTS__*/
function R(e) {
	let t = /* @__PURE__ */ Dn(e);
	return Dt || _i(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function kn(e) {
	let t = /* @__PURE__ */ Dn(e);
	return t.equals = wt, t;
}
function An(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) ii(t[n]);
	}
}
function jn(e) {
	var t, n = U, r = e.parent;
	if (!Ni && r !== null && e.v !== st && r.f & 24576) return ut(), e.v;
	gi(r);
	try {
		e.f &= ~Me, An(e), t = Ci(e);
	} finally {
		gi(n);
	}
	return t;
}
function Mn(e) {
	var t = jn(e);
	if (!e.equals(t) && (e.wv = bi(), (!z?.is_fork || e.deps === null) && (z === null ? e.v = t : (z.capture(e, t, !0), qn?.capture(e, t, !0)), e.deps === null))) {
		Yt(e, xe);
		return;
	}
	Ni || (Jn === null ? Xt(e) : (Hr() || z?.is_fork) && Jn.set(e, t));
}
function Nn(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && mn(() => {
		t.ac.abort(We), t.ac = null;
	}), t.fn !== null && (t.teardown = ye), Ti(t, 0), ni(t));
}
function Pn(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Ei(t);
}
var Fn, In = t((() => {
	A(), N(), W(), hn(), Tt(), at(), mt(), B(), gr(), Mt(), kt(), Bt(), lt(), ir(), En(), M(), Qt(), Fn = Symbol("obsolete");
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/reactivity/batch.js
function Ln(e) {
	var t = Xn;
	Xn = !0;
	try {
		var n;
		for (e && (z !== null && !z.is_fork && z.flush(), n = e());;) {
			if (Ut(), z === null) return n;
			z.flush();
		}
	} finally {
		Xn = t;
	}
}
function Rn() {
	try {
		$e();
	} catch (e) {
		qt(e, Yn);
	}
}
function zn(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && xi(r) && (rr = /* @__PURE__ */ new Set(), Ei(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && oi(r), rr?.size > 0)) {
				mr.clear();
				for (let e of rr) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) rr.has(n) && (rr.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Ei(n);
					}
				}
				rr.clear();
			}
		}
		rr = null;
	}
}
function Bn(e, t, n, r) {
	if (!n.has(e) && (n.add(e), e.reactions !== null)) for (let i of e.reactions) {
		let e = i.f;
		e & 2 ? Bn(i, t, n, r) : e & 4194320 && !(e & 2048) && Vn(i, t, r) && (Yt(i, Se), Hn(i));
	}
}
function Vn(e, t, n) {
	let r = n.get(e);
	if (r !== void 0) return r;
	if (e.deps !== null) for (let r of e.deps) {
		if (ue.call(t, r)) return !0;
		if (r.f & 2 && Vn(r, t, n)) return n.set(r, !0), !0;
	}
	return n.set(e, !1), !1;
}
function Hn(e) {
	z.schedule(e);
}
function Un(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Yt(e, xe);
		for (var n = e.first; n !== null;) Un(n, t), n = n.next;
	}
}
function Wn(e) {
	Yt(e, xe);
	for (var t = e.first; t !== null;) Wn(t), t = t.next;
}
var Gn, Kn, z, qn, Jn, Yn, Xn, Zn, Qn, $n, er, tr, nr, rr, ir = t((() => {
	N(), kt(), M(), W(), at(), Gt(), A(), Jt(), gr(), B(), tn(), lt(), Qt(), cn(), Mt(), ln(), In(), Gn = null, Kn = null, z = null, qn = null, Jn = null, Yn = null, Xn = !1, Zn = !1, Qn = null, $n = null, er = 0, tr = 1, nr = class e {
		id = tr++;
		#e = !1;
		linked = !0;
		#t = null;
		#n = null;
		async_deriveds = /* @__PURE__ */ new Map();
		current = /* @__PURE__ */ new Map();
		previous = /* @__PURE__ */ new Map();
		#r = /* @__PURE__ */ new Set();
		#i = /* @__PURE__ */ new Set();
		#a = 0;
		#o = /* @__PURE__ */ new Map();
		#s = null;
		#c = [];
		#l = [];
		#u = /* @__PURE__ */ new Set();
		#d = /* @__PURE__ */ new Set();
		#f = /* @__PURE__ */ new Map();
		#p = /* @__PURE__ */ new Set();
		is_fork = !1;
		#m = !1;
		constructor() {
			Kn === null ? Gn = Kn = this : (Kn.#n = this, this.#t = Kn), Kn = this;
		}
		#h() {
			if (this.is_fork) return !0;
			for (let n of this.#o.keys()) {
				for (var e = n, t = !1; e.parent !== null;) {
					if (this.#f.has(e)) {
						t = !0;
						break;
					}
					e = e.parent;
				}
				if (!t) return !0;
			}
			return !1;
		}
		skip_effect(e) {
			this.#f.has(e) || this.#f.set(e, {
				d: [],
				m: []
			}), this.#p.delete(e);
		}
		unskip_effect(e, t = (e) => this.schedule(e)) {
			var n = this.#f.get(e);
			if (n) {
				this.#f.delete(e);
				for (var r of n.d) Yt(r, Se), t(r);
				for (r of n.m) Yt(r, Ce), t(r);
			}
			this.#p.add(e);
		}
		#g() {
			this.#e = !0, er++ > 1e3 && (this.#S(), Rn());
			for (let e of this.#u) this.#d.delete(e), Yt(e, Se), this.schedule(e);
			for (let e of this.#d) Yt(e, Ce), this.schedule(e);
			let t = this.#c;
			this.#c = [], this.apply();
			var n = Qn = [], r = [], i = $n = [];
			for (let e of t) try {
				this.#_(e, n, r);
			} catch (t) {
				throw Wn(e), this.#h() || this.discard(), t;
			}
			if (z = null, i.length > 0) {
				var a = e.ensure();
				for (let e of i) a.schedule(e);
			}
			if (Qn = null, $n = null, this.#h()) {
				this.#b(r), this.#b(n);
				for (let [e, t] of this.#f) Un(e, t);
				i.length > 0 && z.#g();
				return;
			}
			let o = this.#v();
			if (o) {
				this.#b(r), this.#b(n), o.#y(this);
				return;
			}
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), qn = this, zn(r), zn(n), qn = null, this.#s?.resolve();
			var s = z;
			if (this.#a === 0 && (this.#c.length === 0 || s !== null) && (this.#S(), Dt && (this.#x(), z = s)), this.#c.length > 0) if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
			s !== null && s.#g();
		}
		#_(e, t, n) {
			e.f ^= xe;
			for (var r = e.first; r !== null;) {
				var i = r.f, a = (i & 96) != 0;
				if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
					a ? r.f ^= xe : i & 4 ? t.push(r) : Dt && i & 16777224 ? n.push(r) : xi(r) && (i & 16 && this.#d.add(r), Ei(r));
					var o = r.first;
					if (o !== null) {
						r = o;
						continue;
					}
				}
				for (; r !== null;) {
					var s = r.next;
					if (s !== null) {
						r = s;
						break;
					}
					r = r.parent;
				}
			}
		}
		#v() {
			for (var e = this.#t; e !== null;) {
				if (!e.is_fork) {
					for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
				}
				e = e.#t;
			}
			return null;
		}
		#y(e) {
			for (let [t, n] of e.current) !this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n);
			for (let [t, n] of e.async_deriveds) {
				let e = this.async_deriveds.get(t);
				e && n.promise.then(e.resolve).catch(e.reject);
			}
			e.async_deriveds.clear(), this.transfer_effects(e.#u, e.#d);
			let t = (e) => {
				var n = e.reactions;
				if (n !== null && !(e.f & 2 && !(e.f & 6144))) for (let e of n) {
					var r = e.f;
					if (r & 2) t(e);
					else {
						var i = e;
						r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), Yt(i, Se), this.schedule(i));
					}
				}
			};
			for (let e of this.current.keys()) t(e);
			this.oncommit(() => e.discard()), e.#S(), z = this, this.#g();
		}
		#b(e) {
			for (var t = 0; t < e.length; t += 1) en(e[t], this.#u, this.#d);
		}
		capture(e, t, n = !1) {
			e.v !== st && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Jn?.set(e, t)), this.is_fork || (e.v = t);
		}
		activate() {
			z = this;
		}
		deactivate() {
			z = null, Jn = null;
		}
		flush() {
			try {
				Zn = !0, z = this, this.#g();
			} finally {
				er = 0, Yn = null, Qn = null, $n = null, Zn = !1, z = null, Jn = null, mr.clear();
			}
		}
		discard() {
			for (let e of this.#i) e(this);
			this.#i.clear();
			for (let e of this.async_deriveds.values()) e.reject(Fn);
			this.#S(), this.#s?.resolve();
		}
		register_created_effect(e) {
			this.#l.push(e);
		}
		#x() {
			for (let u = Gn; u !== null; u = u.#n) {
				var e = u.id < this.id, t = [];
				for (let [r, [i, a]] of this.current) {
					if (u.current.has(r)) {
						var n = u.current.get(r)[0];
						if (e && i !== n) u.current.set(r, [i, a]);
						else continue;
					}
					t.push(r);
				}
				if (e) for (let [e, t] of this.async_deriveds) {
					let n = u.async_deriveds.get(e);
					n && t.promise.then(n.resolve).catch(n.reject);
				}
				var r = [...u.current.keys()].filter((e) => !u.current.get(e)[1]);
				if (!(!u.#e || r.length === 0)) {
					var i = r.filter((e) => !this.current.has(e));
					if (i.length === 0) e && u.discard();
					else if (t.length > 0) {
						if (e) for (let e of this.#p) u.unskip_effect(e, (e) => {
							e.f & 4194320 ? u.schedule(e) : u.#b([e]);
						});
						u.activate();
						var a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
						for (var s of t) Bn(s, i, a, o);
						o = /* @__PURE__ */ new Map();
						var c = [...u.current].filter(([e, t]) => {
							let n = this.current.get(e);
							return !n || n[0] !== t[0] || n[1] !== t[1];
						}).map(([e]) => e);
						if (c.length > 0) for (let e of this.#l) !(e.f & 155648) && Vn(e, c, o) && (e.f & 4194320 ? (Yt(e, Se), u.schedule(e)) : u.#u.add(e));
						if (u.#c.length > 0 && !u.#m) {
							u.apply();
							for (var l of u.#c) u.#_(l, [], []);
							u.#c = [];
						}
						u.deactivate();
					}
				}
			}
		}
		increment(e, t) {
			if (this.#a += 1, e) {
				let e = this.#o.get(t) ?? 0;
				this.#o.set(t, e + 1);
			}
		}
		decrement(e, t) {
			if (--this.#a, e) {
				let e = this.#o.get(t) ?? 0;
				e === 1 ? this.#o.delete(t) : this.#o.set(t, e - 1);
			}
			this.#m || (this.#m = !0, Ht(() => {
				this.#m = !1, this.linked && this.flush();
			}));
		}
		transfer_effects(e, t) {
			for (let t of e) this.#u.add(t);
			for (let e of t) this.#d.add(e);
			e.clear(), t.clear();
		}
		oncommit(e) {
			this.#r.add(e);
		}
		ondiscard(e) {
			this.#i.add(e);
		}
		settled() {
			return (this.#s ??= ce()).promise;
		}
		static ensure() {
			if (z === null) {
				let t = z = new e();
				!Zn && !Xn && Ht(() => {
					t.#e || t.flush();
				});
			}
			return z;
		}
		apply() {
			if (!Dt || !this.is_fork && this.#t === null && this.#n === null) {
				Jn = null;
				return;
			}
			Jn = /* @__PURE__ */ new Map();
			for (let [e, [t]] of this.current) Jn.set(e, t);
			for (let t = Gn; t !== null; t = t.#n) if (!(t === this || t.is_fork)) {
				var e = !1;
				if (t.id < this.id) {
					for (let [n, [, r]] of t.current) if (!r && this.current.has(n)) {
						e = !0;
						break;
					}
				}
				if (!e) for (let [e, n] of t.previous) Jn.has(e) || Jn.set(e, n);
			}
		}
		schedule(e) {
			if (Yn = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
				e.b.defer_effect(e);
				return;
			}
			for (var t = e; t.parent !== null;) {
				t = t.parent;
				var n = t.f;
				if (Qn !== null && t === U && (Dt || (H === null || !(H.f & 2)) && !on)) return;
				if (n & 96) {
					if (!(n & 1024)) return;
					t.f ^= xe;
				}
			}
			this.#c.push(t);
		}
		#S() {
			if (this.linked) {
				var e = this.#t, t = this.#n;
				e === null ? Gn = t : e.#n = t, t === null ? Kn = e : t.#t = e, this.linked = !1;
			}
		}
	}, rr = null;
}));
function ar(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: St,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function or(e, t) {
	let n = ar(e, t);
	return _i(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function sr(e, t = !1, n = !0) {
	let r = ar(e);
	return t || (r.equals = wt), Ot && n && L !== null && L.l !== null && (L.l.s ??= []).push(r), r;
}
function cr(e, t, n = !1) {
	return H !== null && (!Pi || H.f & 131072) && Lt() && H.f & 4325394 && (Fi === null || !Fi.has(e)) && rt(), lr(e, n ? _r(t) : t, $n);
}
function lr(e, t, n = null) {
	if (!e.equals(t)) {
		mr.set(e, Ni ? t : e.v);
		var r = nr.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && jn(t), Jn === null && Xt(t);
		}
		e.wv = bi(), fr(e, Se, n), Lt() && U !== null && U.f & 1024 && !(U.f & 96) && (Ri === null ? vi([e]) : Ri.push(e)), !r.is_fork && pr.size > 0 && !hr && ur();
	}
	return t;
}
function ur() {
	hr = !1;
	for (let e of pr) {
		e.f & 1024 && Yt(e, Ce);
		let t;
		try {
			t = xi(e);
		} catch {
			t = !0;
		}
		t && Ei(e);
	}
	pr.clear();
}
function dr(e) {
	cr(e, e.v + 1);
}
function fr(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Lt(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === U)) {
			var l = (c & Se) === 0;
			if (l && Yt(s, t), c & 131072) pr.add(s);
			else if (c & 2) {
				var u = s;
				Jn?.delete(u), c & 65536 || (c & 512 && (U === null || !(U.f & 2097152)) && (s.f |= Me), fr(u, Ce, n));
			} else if (l) {
				var d = s;
				c & 16 && rr !== null && rr.add(d), n === null ? Hn(d) : n.push(d);
			}
		}
	}
}
var pr, mr, hr, gr = t((() => {
	A(), W(), Tt(), N(), at(), kt(), jt(), Mt(), Bt(), ir(), br(), In(), Qt(), pr = /* @__PURE__ */ new Set(), mr = /* @__PURE__ */ new Map(), hr = !1;
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/proxy.js
function _r(e) {
	if (typeof e != "object" || !e || Ie in e) return e;
	let t = _e(e);
	if (t !== he && t !== ge) return e;
	var n = /* @__PURE__ */ new Map(), r = le(e), i = /* @__PURE__ */ or(0), a = null, o = Vi, s = (e) => {
		if (Vi === o) return e();
		var t = H, n = Vi;
		hi(null), yi(o);
		var r = e();
		return hi(t), yi(n), r;
	};
	return r && n.set("length", /* @__PURE__ */ or(e.length, a)), new Proxy(e, {
		defineProperty(e, t, r) {
			(!("value" in r) || r.configurable === !1 || r.enumerable === !1 || r.writable === !1) && tt();
			var i = n.get(t);
			return i === void 0 ? s(() => {
				var e = /* @__PURE__ */ or(r.value, a);
				return n.set(t, e), e;
			}) : cr(i, r.value, !0), !0;
		},
		deleteProperty(e, t) {
			var r = n.get(t);
			if (r === void 0) {
				if (t in e) {
					let e = s(() => /* @__PURE__ */ or(st, a));
					n.set(t, e), dr(i);
				}
			} else cr(r, st), dr(i);
			return !0;
		},
		get(t, r, i) {
			if (r === Ie) return e;
			var o = n.get(r), c = r in t;
			if (o === void 0 && (!c || pe(t, r)?.writable) && (o = s(() => /* @__PURE__ */ or(_r(c ? t[r] : st), a)), n.set(r, o)), o !== void 0) {
				var l = V(o);
				return l === st ? void 0 : l;
			}
			return Reflect.get(t, r, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var r = Reflect.getOwnPropertyDescriptor(e, t);
			if (r && "value" in r) {
				var i = n.get(t);
				i && (r.value = V(i));
			} else if (r === void 0) {
				var a = n.get(t), o = a?.v;
				if (a !== void 0 && o !== st) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return r;
		},
		has(e, t) {
			if (t === Ie) return !0;
			var r = n.get(t), i = r !== void 0 && r.v !== st || Reflect.has(e, t);
			return (r !== void 0 || U !== null && (!i || pe(e, t)?.writable)) && (r === void 0 && (r = s(() => /* @__PURE__ */ or(i ? _r(e[t]) : st, a)), n.set(t, r)), V(r) === st) ? !1 : i;
		},
		set(e, t, o, c) {
			var l = n.get(t), u = t in e;
			if (r && t === "length") for (var d = o; d < l.v; d += 1) {
				var f = n.get(d + "");
				f === void 0 ? d in e && (f = s(() => /* @__PURE__ */ or(st, a)), n.set(d + "", f)) : cr(f, st);
			}
			if (l === void 0) (!u || pe(e, t)?.writable) && (l = s(() => /* @__PURE__ */ or(void 0, a)), cr(l, _r(o)), n.set(t, l));
			else {
				u = l.v !== st;
				var p = s(() => _r(o));
				cr(l, p);
			}
			var m = Reflect.getOwnPropertyDescriptor(e, t);
			if (m?.set && m.set.call(c, o), !u) {
				if (r && typeof t == "string") {
					var h = n.get("length"), g = Number(t);
					Number.isInteger(g) && g >= h.v && cr(h, g + 1);
				}
				dr(i);
			}
			return !0;
		},
		ownKeys(e) {
			V(i);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = n.get(e);
				return t === void 0 || t.v !== st;
			});
			for (var [r, a] of n) a.v !== st && !(r in e) && t.push(r);
			return t;
		},
		setPrototypeOf() {
			nt();
		}
	});
}
function vr(e) {
	try {
		if (typeof e == "object" && e && Ie in e) return e[Ie];
	} catch {}
	return e;
}
function yr(e, t) {
	return Object.is(vr(e), vr(t));
}
var br = t((() => {
	A(), W(), M(), gr(), N(), lt(), at(), jt(), Mt(), kt();
})), xr = t((() => {
	mt(), br();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/operations.js
function Sr() {
	if (Nr === void 0) {
		Nr = window, Pr = document, Fr = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Ir = pe(t, "firstChild").get, Lr = pe(t, "nextSibling").get, ve(e) && (e[Be] = void 0, e[ze] = null, e[Ve] = void 0, e.__e = void 0), ve(n) && (n[He] = void 0);
	}
}
function Cr(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function wr(e) {
	return Ir.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Tr(e) {
	return Lr.call(e);
}
function Er(e, t) {
	if (!F) return /* @__PURE__ */ wr(e);
	var n = /* @__PURE__ */ wr(I);
	if (n === null) n = I.appendChild(Cr());
	else if (t && n.nodeType !== 3) {
		var r = Cr();
		return n?.before(r), gt(r), r;
	}
	return t && Mr(n), gt(n), n;
}
function Dr(e, t = !1) {
	if (!F) {
		var n = /* @__PURE__ */ wr(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Tr(n) : n;
	}
	if (t) {
		if (I?.nodeType !== 3) {
			var r = Cr();
			return I?.before(r), gt(r), r;
		}
		Mr(I);
	}
	return I;
}
function Or(e, t = 1, n = !1) {
	let r = F ? I : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ Tr(r);
	if (!F) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = Cr();
			return r === null ? i?.after(a) : r.before(a), gt(a), a;
		}
		Mr(r);
	}
	return gt(r), r;
}
function kr(e) {
	e.textContent = "";
}
function Ar() {
	return !Dt || rr !== null ? !1 : (U.f & Ee) !== 0;
}
function jr(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function Mr(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
var Nr, Pr, Fr, Ir, Lr, Rr = t((() => {
	xt(), A(), xr(), M(), W(), kt(), N(), ir(), lt();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/reactivity/effects.js
function zr(e) {
	U === null && (H === null && Qe(e), Ze()), Ni && Xe(e);
}
function Br(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Vr(e, t) {
	var n = U;
	n !== null && n.f & 8192 && (e |= we);
	var r = {
		ctx: L,
		deps: null,
		nodes: null,
		f: e | Se | 512,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: n,
		b: n && n.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	z?.register_created_effect(r);
	var i = r;
	if (e & 4) Qn === null ? nr.ensure().schedule(r) : Qn.push(r);
	else if (t !== null) {
		try {
			Ei(r);
		} catch (e) {
			throw ii(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= Oe));
	}
	if (i !== null && (i.parent = n, n !== null && Br(i, n), H !== null && H.f & 2 && !(e & 64))) {
		var a = H;
		(a.effects ??= []).push(i);
	}
	return r;
}
function Hr() {
	return H !== null && !Pi;
}
function Ur(e) {
	let t = Vr(8, null);
	return Yt(t, xe), t.teardown = e, t;
}
function Wr(e) {
	zr("$effect");
	var t = U.f;
	if (!H && t & 32 && L !== null && !L.i) {
		var n = L;
		(n.e ??= []).push(e);
	} else return Gr(e);
}
function Gr(e) {
	return Vr(4 | Ae, e);
}
function Kr(e) {
	return zr("$effect.pre"), Vr(8 | Ae, e);
}
function qr(e) {
	nr.ensure();
	let t = Vr(64 | ke, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? si(t, () => {
			ii(t), n(void 0);
		}) : (ii(t), n(void 0));
	});
}
function Jr(e) {
	return Vr(4, e);
}
function Yr(e) {
	return Vr(Pe | ke, e);
}
function Xr(e, t = 0) {
	return Vr(8 | t, e);
}
function Zr(e, t = [], n = [], r = []) {
	Sn(r, t, n, (t) => {
		Vr(8, () => {
			e(...t.map(V));
		});
	});
}
function Qr(e, t = 0) {
	return Vr(16 | t, e);
}
function $r(e, t = 0) {
	return Vr(be | t, e);
}
function ei(e) {
	return Vr(32 | ke, e);
}
function ti(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Ni, n = H;
		mi(!0), hi(null);
		try {
			t.call(null);
		} finally {
			mi(e), hi(n);
		}
	}
}
function ni(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && mn(() => {
			e.abort(We);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : ii(n, t), n = r;
	}
}
function ri(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || ii(t), t = n;
	}
}
function ii(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (ai(e.nodes.start, e.nodes.end), n = !0), e.f |= De, ni(e, t && !n), Ti(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	ti(e), e.f ^= De, e.f |= Te;
	var i = e.parent;
	i !== null && i.first !== null && oi(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function ai(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ Tr(e);
		e.remove(), e = n;
	}
}
function oi(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function si(e, t, n = !0) {
	var r = [];
	ci(e, r, !0);
	var i = () => {
		n && ii(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function ci(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= we;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = (i.f & 65536) != 0 || (i.f & 32) != 0 && (e.f & 16) != 0;
				ci(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function li(e) {
	ui(e, !0);
}
function ui(e, t) {
	if (e.f & 8192) {
		e.f ^= we, e.f & 1024 || (Yt(e, Se), nr.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = (n.f & 65536) != 0 || (n.f & 32) != 0;
			ui(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function di(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ Tr(n);
		t.append(n), n = i;
	}
}
var B = t((() => {
	W(), N(), at(), A(), M(), Rr(), Bt(), ir(), En(), hn(), Qt();
})), fi, pi = t((() => {
	gr(), W(), fi = null;
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/runtime.js
function mi(e) {
	Ni = e;
}
function hi(e) {
	H = e;
}
function gi(e) {
	U = e;
}
function _i(e) {
	H !== null && (!Dt || H.f & 2) && (Fi ??= /* @__PURE__ */ new Set()).add(e);
}
function vi(e) {
	Ri = e;
}
function yi(e) {
	Vi = e;
}
function bi() {
	return ++zi;
}
function xi(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~Me), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (xi(a) && Mn(a), a.wv > e.wv) return !0;
		}
		t & 512 && Jn === null && Yt(e, xe);
	}
	return !1;
}
function Si(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(!Dt && Fi !== null && Fi.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Si(a, t, !1) : t === a && (n ? Yt(a, Se) : a.f & 1024 && Yt(a, Ce), Hn(a));
	}
}
function Ci(e) {
	var t = Ii, n = Li, r = Ri, i = H, a = Fi, o = L, s = Pi, c = Vi, l = e.f;
	Ii = null, Li = 0, Ri = null, H = l & 96 ? null : e, Fi = null, Nt(e.ctx), Pi = !1, Vi = ++Bi, e.ac !== null && (mn(() => {
		e.ac.abort(We);
	}), e.ac = null);
	try {
		e.f |= Ne;
		var u = e.fn, d = u();
		e.f |= Ee;
		var f = e.deps, p = z?.is_fork;
		if (Ii !== null) {
			var m;
			if (p || Ti(e, Li), f !== null && Li > 0) for (f.length = Li + Ii.length, m = 0; m < Ii.length; m++) f[Li + m] = Ii[m];
			else e.deps = f = Ii;
			if (Hr() && e.f & 512) for (m = Li; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Li < f.length && (Ti(e, Li), f.length = Li);
		if (Lt() && Ri !== null && !Pi && f !== null && !(e.f & 6146)) for (m = 0; m < Ri.length; m++) Si(Ri[m], e);
		if (i !== null && i !== e) {
			if (Bi++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Bi;
			if (t !== null) for (let e of t) e.rv = Bi;
			Ri !== null && (r === null ? r = Ri : r.push(...Ri));
		}
		return e.f & 8388608 && (e.f ^= Fe), d;
	} catch (e) {
		return Kt(e);
	} finally {
		e.f ^= Ne, Ii = t, Li = n, Ri = r, H = i, Fi = a, Nt(o), Pi = s, Vi = c;
	}
}
function wi(e, t) {
	let n = t.reactions;
	if (n !== null) {
		var r = j.call(n, e);
		if (r !== -1) {
			var i = n.length - 1;
			i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
		}
	}
	if (n === null && t.f & 2 && (Ii === null || !ue.call(Ii, t))) {
		var a = t;
		a.f & 512 && (a.f ^= 512, a.f &= ~Me), a.v !== st && Xt(a), a.ac !== null && mn(() => {
			a.ac.abort(We), a.ac = null, Yt(a, Se);
		}), Nn(a), Ti(a, 0);
	}
}
function Ti(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) wi(e, n[r]);
}
function Ei(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Yt(e, xe);
		var n = U, r = Mi;
		U = e, Mi = (t & 96) == 0;
		try {
			t & 16777232 ? ri(e) : ni(e), ti(e);
			var i = Ci(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = zi;
		} finally {
			Mi = r, U = n;
		}
	}
}
function V(e) {
	var t = (e.f & 2) != 0;
	if (fi?.add(e), H !== null && !Pi && !(U !== null && U.f & 16384) && (Fi === null || !Fi.has(e))) {
		var n = H.deps;
		if (H.f & 2097152) e.rv < Bi && (e.rv = Bi, Ii === null && n !== null && n[Li] === e ? Li++ : Ii === null ? Ii = [e] : Ii.push(e));
		else {
			H.deps ??= [], ue.call(H.deps, e) || H.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [H] : ue.call(r, H) || r.push(H);
		}
	}
	if (Ni && mr.has(e)) return mr.get(e);
	if (t) {
		var i = e;
		if (Ni) {
			var a = i.v;
			return (!(i.f & 1024) && i.reactions !== null || Oi(i)) && (a = jn(i)), mr.set(i, a), a;
		}
		var o = (i.f & 512) == 0 && !Pi && H !== null && (Mi || (H.f & 512) != 0), s = (i.f & Ee) === 0;
		xi(i) && (o && (i.f |= 512), Mn(i)), o && !s && (Pn(i), Di(i));
	}
	if (Jn?.has(e)) return Jn.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Di(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Pn(t), Di(t));
}
function Oi(e) {
	if (e.v === st) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (mr.has(t) || t.f & 2 && Oi(t)) return !0;
	return !1;
}
function ki(e) {
	var t = Pi;
	try {
		return Pi = !0, e();
	} finally {
		Pi = t;
	}
}
function Ai(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (Ie in e) ji(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && Ie in n && ji(n);
		}
	}
}
function ji(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "object" && e && !(e instanceof EventTarget) && !t.has(e)) {
		t.add(e), e instanceof Date && e.getTime();
		for (let n in e) try {
			ji(e[n], t);
		} catch {}
		let n = _e(e);
		if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
			let t = me(n);
			for (let n in t) {
				let r = t[n].get;
				if (r) try {
					r.call(e);
				} catch {}
			}
		}
	}
}
var Mi, Ni, H, Pi, U, Fi, Ii, Li, Ri, zi, Bi, Vi, W = t((() => {
	A(), M(), B(), N(), gr(), In(), kt(), jt(), Mt(), Bt(), ir(), Jt(), lt(), pi(), hn(), Qt(), mt(), Mi = !1, Ni = !1, H = null, Pi = !1, U = null, Fi = null, Ii = null, Li = 0, Ri = null, zi = 1, Bi = 0, Vi = Bi;
})), Hi = t((() => {
	vs(), Cs(), B();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/utils.js
function Ui(e) {
	return e.endsWith("capture") && e !== "gotpointercapture" && e !== "lostpointercapture";
}
function Wi(e) {
	return qi.includes(e);
}
function Gi(e) {
	return e = e.toLowerCase(), Yi[e] ?? e;
}
function Ki(e) {
	return Xi.includes(e);
}
var qi, Ji, Yi, Xi, Zi, Qi = t((() => {
	qi = [
		"beforeinput",
		"click",
		"change",
		"dblclick",
		"contextmenu",
		"focusin",
		"focusout",
		"input",
		"keydown",
		"keyup",
		"mousedown",
		"mousemove",
		"mouseout",
		"mouseover",
		"mouseup",
		"pointerdown",
		"pointermove",
		"pointerout",
		"pointerover",
		"pointerup",
		"touchend",
		"touchmove",
		"touchstart"
	], Ji = /* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split("."), Yi = {
		formnovalidate: "formNoValidate",
		ismap: "isMap",
		nomodule: "noModule",
		playsinline: "playsInline",
		readonly: "readOnly",
		defaultvalue: "defaultValue",
		defaultchecked: "defaultChecked",
		srcobject: "srcObject",
		novalidate: "noValidate",
		allowfullscreen: "allowFullscreen",
		disablepictureinpicture: "disablePictureInPicture",
		disableremoteplayback: "disableRemotePlayback"
	}, [...Ji], Xi = ["touchstart", "touchmove"], Zi = [
		"$state",
		"$state.raw",
		"$derived",
		"$derived.by"
	], [...Zi];
})), $i = t((() => {
	N(), Qi(), W();
})), ea = t((() => {
	N(), xt(), Bt();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/elements/events.js
function ta(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || aa.call(t, e), !e.cancelBubble) return mn(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ht(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function na(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = ta(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && Ur(() => {
		t.removeEventListener(e, o, a);
	});
}
function ra(e, t, n) {
	(t[oa] ??= {})[e] = n;
}
function ia(e) {
	for (var t = 0; t < e.length; t++) sa.add(e[t]);
	for (var n of ca) n(e);
}
function aa(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	la = e;
	var o = 0, s = la === e && e[oa];
	if (s) {
		var c = i.indexOf(s);
		if (c !== -1 && (t === document || t === window)) {
			e[oa] = t;
			return;
		}
		var l = i.indexOf(t);
		if (l === -1) return;
		c <= l && (o = c);
	}
	if (a = i[o] || e.target, a !== t) {
		fe(e, "currentTarget", {
			configurable: !0,
			get() {
				return a || n;
			}
		});
		var u = H, d = U;
		hi(null), gi(null);
		try {
			for (var f, p = []; a !== null && a !== t;) {
				try {
					var m = a[oa]?.[r];
					m != null && (!a.disabled || e.target === a) && m.call(a, e);
				} catch (e) {
					f ? p.push(e) : f = e;
				}
				if (e.cancelBubble) break;
				o++, a = o < i.length ? i[o] : null;
			}
			if (f) {
				for (let e of p) queueMicrotask(() => {
					throw e;
				});
				throw f;
			}
		} finally {
			e[oa] = t, delete e.currentTarget, hi(u), gi(d);
		}
	}
}
var oa, sa, ca, la, ua = t((() => {
	B(), M(), xt(), Gt(), W(), hn(), oa = Symbol("events"), sa = /* @__PURE__ */ new Set(), ca = /* @__PURE__ */ new Set(), la = null;
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/reconciler.js
function da(e) {
	return pa?.createHTML(e) ?? e;
}
function fa(e) {
	var t = jr("template");
	return t.innerHTML = da(e.replaceAll("<!>", "<!---->")), t.content;
}
var pa, ma = t((() => {
	Rr(), pa = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/template.js
function ha(e, t) {
	var n = U;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function ga(e, t) {
	var n = (t & 1) != 0, r = (t & 2) != 0, i, a = !e.startsWith("<!>");
	return () => {
		if (F) return ha(I, null), I;
		i === void 0 && (i = fa(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ wr(i)));
		var t = r || Fr ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ wr(t), s = t.lastChild;
			ha(o, s);
		} else ha(t, t);
		return t;
	};
}
function _a() {
	if (F) return ha(I, null), I;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = Cr();
	return e.append(t, n), ha(t, n), e;
}
function va(e, t) {
	if (F) {
		var n = U;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = I), _t();
		return;
	}
	e !== null && e.before(t);
}
var ya = t((() => {
	xt(), Rr(), ma(), W(), lt(), N();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/render.js
function ba(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[He] ??= e.nodeValue) && (e[He] = n, e.nodeValue = `${n}`);
}
function xa(e, t) {
	return Sa(e, t);
}
function Sa(e, { target: t, anchor: n, props: r = {}, events: i, context: a, intro: o = !0, transformError: s }) {
	Sr();
	var c = void 0, l = qr(() => {
		var l = n ?? t.appendChild(Cr());
		vn(l, { pending: () => {} }, (t) => {
			Ft({});
			var n = L;
			if (a && (n.c = a), i && (r.$$events = i), F && ha(t, null), wa = o, c = e(t, r) || {}, wa = !0, F && (U.nodes.end = I, I === null || I.nodeType !== 8 || I.data !== "]")) throw dt(), ot;
			It();
		}, s);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = Ki(r);
					for (let e of [t, document]) {
						var a = Ta.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Ta.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, aa, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(de(sa)), ca.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Ta.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, aa), r.delete(e), r.size === 0 && Ta.delete(n)) : r.set(e, i);
			}
			ca.delete(d), l !== n && l.parentNode?.removeChild(l);
		};
	});
	return Ea.set(c, l), c;
}
function Ca(e, t) {
	let n = Ea.get(e);
	return n ? (Ea.delete(e), n(t)) : Promise.resolve();
}
var wa, Ta, Ea, Da = t((() => {
	A(), Rr(), lt(), W(), Bt(), B(), xt(), M(), ua(), mt(), at(), ya(), Qi(), N(), xn(), Ta = /* @__PURE__ */ new Map(), Ea = /* @__PURE__ */ new WeakMap();
})), Oa = t((() => {
	N(), xt(), B(), gr(), Da(), W();
})), ka = t((() => {
	M(), N(), Bt(), Qi();
})), Aa = t((() => {
	at(), Bt();
})), ja = t((() => {
	At(), B(), W(), Mt();
})), Ma = t((() => {
	En(), W(), xt(), ya();
})), Na = t((() => {
	at();
})), Pa, Fa = t((() => {
	ir(), B(), N(), xt(), Rr(), A(), Pa = class {
		anchor;
		#e = /* @__PURE__ */ new Map();
		#t = /* @__PURE__ */ new Map();
		#n = /* @__PURE__ */ new Map();
		#r = /* @__PURE__ */ new Set();
		#i = !0;
		constructor(e, t = !0) {
			this.anchor = e, this.#i = t;
		}
		#a = (e) => {
			if (this.#e.has(e)) {
				var t = this.#e.get(e), n = this.#t.get(t);
				if (n) li(n), this.#r.delete(t);
				else {
					var r = this.#n.get(t);
					r && (li(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
				}
				for (let [t, n] of this.#e) {
					if (this.#e.delete(t), t === e) break;
					let r = this.#n.get(n);
					r && (ii(r.effect), this.#n.delete(n));
				}
				for (let [e, r] of this.#t) {
					if (e === t || this.#r.has(e)) continue;
					let i = () => {
						if (Array.from(this.#e.values()).includes(e)) {
							var t = document.createDocumentFragment();
							di(r, t), t.append(Cr()), this.#n.set(e, {
								effect: r,
								fragment: t
							});
						} else ii(r);
						this.#r.delete(e), this.#t.delete(e);
					};
					this.#i || !n ? (this.#r.add(e), si(r, i, !1)) : i();
				}
			}
		};
		#o = (e) => {
			this.#e.delete(e);
			let t = Array.from(this.#e.values());
			for (let [e, n] of this.#n) t.includes(e) || (ii(n.effect), this.#n.delete(e));
		};
		ensure(e, t) {
			var n = z, r = Ar();
			if (t && !this.#t.has(e) && !this.#n.has(e)) if (r) {
				var i = document.createDocumentFragment(), a = Cr();
				i.append(a), this.#n.set(e, {
					effect: ei(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, ei(() => t(this.anchor)));
			if (this.#e.set(n, e), r) {
				for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
				for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
				n.oncommit(this.#a), n.ondiscard(this.#o);
			} else F && (this.anchor = I), this.#a(n);
		}
	};
})), Ia = t((() => {
	M(), B(), gr(), xt(), Gt(), Bt(), ir(), Fa(), En();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/blocks/if.js
function La(e, t, n = !1) {
	var r;
	F && (r = I, _t());
	var i = new Pa(e), a = n ? Oe : 0;
	function o(e, t) {
		if (F) {
			var n = bt(r);
			if (e !== parseInt(n.substring(1))) {
				var a = yt();
				gt(a), i.anchor = a, ht(!1), i.ensure(e, t), ht(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	Qr(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
var Ra = t((() => {
	N(), xt(), B(), Fa();
})), za = t((() => {
	Bt(), B(), xt(), Fa();
})), Ba = t((() => {
	B(), xt(), Rr();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/blocks/each.js
function Va(e, t) {
	return t;
}
function Ha(e, t, n) {
	for (var r = [], i = t.length, a, o = t.length, s = 0; s < i; s++) {
		let n = t[s];
		si(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					Ua(e, de(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --o;
		}, !1);
	}
	if (o === 0) {
		var c = r.length === 0 && n !== null;
		if (c) {
			var l = n, u = l.parentNode;
			kr(u), u.append(l), e.items.clear();
		}
		Ua(e, t, !c);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function Ua(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= je, di(a, document.createDocumentFragment())) : ii(t[i], n);
	}
}
function Wa(e, t, n, r, i, a = null) {
	var o = e, s = /* @__PURE__ */ new Map();
	if (t & 4) {
		var c = e;
		o = F ? gt(/* @__PURE__ */ wr(c)) : c.appendChild(Cr());
	}
	F && _t();
	var l = null, u = /* @__PURE__ */ kn(() => {
		var e = n();
		return le(e) ? e : e == null ? [] : de(e);
	}), d, f = /* @__PURE__ */ new Map(), p = !0;
	function m(e) {
		g.effect.f & 16384 || (g.pending.delete(e), g.fallback = l, Ka(g, d, o, t, r), l !== null && (d.length === 0 ? l.f & 33554432 ? (l.f ^= je, Ja(l, null, o)) : li(l) : si(l, () => {
			l = null;
		})));
	}
	function h(e) {
		g.pending.delete(e);
	}
	var g = {
		effect: Qr(() => {
			d = V(u);
			var e = d.length;
			let c = !1;
			F && bt(o) === "[!" != (e === 0) && (o = yt(), gt(o), ht(!1), c = !0);
			for (var g = /* @__PURE__ */ new Set(), _ = z, v = Ar(), y = 0; y < e; y += 1) {
				F && I.nodeType === 8 && I.data === "]" && (o = I, c = !0, ht(!1));
				var b = d[y], x = r(b, y), S = p ? null : s.get(x);
				S ? (S.v && lr(S.v, b), S.i && lr(S.i, y), v && _.unskip_effect(S.e)) : (S = qa(s, p ? o : Xa ??= Cr(), b, x, y, i, t, n), p || (S.e.f |= je), s.set(x, S)), g.add(x);
			}
			if (e === 0 && a && !l && (p ? l = ei(() => a(o)) : (l = ei(() => a(Xa ??= Cr())), l.f |= je)), e > g.size && Ye("", "", ""), F && e > 0 && gt(yt()), !p) if (f.set(_, g), v) {
				for (let [e, t] of s) g.has(e) || _.skip_effect(t.e);
				_.oncommit(m), _.ondiscard(h);
			} else m(_);
			c && ht(!0), V(u);
		}),
		flags: t,
		items: s,
		pending: f,
		outrogroups: null,
		fallback: l
	};
	p = !1, F && (o = I);
}
function Ga(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Ka(e, t, n, r, i) {
	var a = (r & 8) != 0, o = t.length, s = e.items, c = Ga(e.effect.first), l, u = null, d, f = [], p = [], m, h, g, _;
	if (a) for (_ = 0; _ < o; _ += 1) m = t[_], h = i(m, _), g = s.get(h).e, g.f & 33554432 || (g.nodes?.a?.measure(), (d ??= /* @__PURE__ */ new Set()).add(g));
	for (_ = 0; _ < o; _ += 1) {
		if (m = t[_], h = i(m, _), g = s.get(h).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(g), t.done.delete(g);
		if (g.f & 8192 && (li(g), a && (g.nodes?.a?.unfix(), (d ??= /* @__PURE__ */ new Set()).delete(g))), g.f & 33554432) if (g.f ^= je, g === c) Ja(g, null, n);
		else {
			var v = u ? u.next : c;
			g === e.effect.last && (e.effect.last = g.prev), g.prev && (g.prev.next = g.next), g.next && (g.next.prev = g.prev), Ya(e, u, g), Ya(e, g, v), Ja(g, v, n), u = g, f = [], p = [], c = Ga(u.next);
			continue;
		}
		if (g !== c) {
			if (l !== void 0 && l.has(g)) {
				if (f.length < p.length) {
					var y = p[0], b;
					u = y.prev;
					var x = f[0], S = f[f.length - 1];
					for (b = 0; b < f.length; b += 1) Ja(f[b], y, n);
					for (b = 0; b < p.length; b += 1) l.delete(p[b]);
					Ya(e, x.prev, S.next), Ya(e, u, x), Ya(e, S, y), c = y, u = S, --_, f = [], p = [];
				} else l.delete(g), Ja(g, c, n), Ya(e, g.prev, g.next), Ya(e, g, u === null ? e.effect.first : u.next), Ya(e, u, g), u = g;
				continue;
			}
			for (f = [], p = []; c !== null && c !== g;) (l ??= /* @__PURE__ */ new Set()).add(c), p.push(c), c = Ga(c.next);
			if (c === null) continue;
		}
		g.f & 33554432 || f.push(g), u = g, c = Ga(g.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Ua(e, de(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (c !== null || l !== void 0) {
		var C = [];
		if (l !== void 0) for (g of l) g.f & 8192 || C.push(g);
		for (; c !== null;) !(c.f & 8192) && c !== e.fallback && C.push(c), c = Ga(c.next);
		var w = C.length;
		if (w > 0) {
			var T = r & 4 && o === 0 ? n : null;
			if (a) {
				for (_ = 0; _ < w; _ += 1) C[_].nodes?.a?.measure();
				for (_ = 0; _ < w; _ += 1) C[_].nodes?.a?.fix();
			}
			Ha(e, C, T);
		}
	}
	a && Ht(() => {
		if (d !== void 0) for (g of d) g.nodes?.a?.apply();
	});
}
function qa(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? ar(n) : /* @__PURE__ */ sr(n, !1, !1) : null, l = o & 2 ? ar(i) : null;
	return {
		v: c,
		i: l,
		e: ei(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Ja(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ Tr(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Ya(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
var Xa, Za = t((() => {
	lt(), xt(), Rr(), B(), gr(), M(), N(), Gt(), W(), A(), In(), ir(), at(), jt();
})), Qa = t((() => {
	B(), xt(), ya(), Qi(), Bt(), Rr(), W(), N();
})), $a = t((() => {
	xt();
})), eo = t((() => {
	Qi(), qe();
})), to = t((() => {
	N(), B(), Bt(), xt(), ma(), ya(), at(), Rr(), eo(), Fa();
})), no = t((() => {
	N(), B(), xt(), Fa();
})), ro = t((() => {
	M();
})), io = t((() => {
	ro();
})), ao = t((() => {
	M(), B(), W(), io(), Da(), N(), Gt(), hn();
})), oo = t((() => {
	xt(), Rr(), B(), Da(), W(), Bt(), N(), ya(), Qi(), Fa(), ao();
})), so = t((() => {
	xt(), Rr(), B(), N();
})), co = t((() => {
	B(), Rr();
})), lo = t((() => {
	B(), W();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/elements/attachments.js
function uo(e, t) {
	var n = void 0, r;
	$r(() => {
		n !== (n = t()) && (r &&= (ii(r), null), n && (r = ei(() => {
			Jr(() => n(e));
		})));
	});
}
var fo = t((() => {
	B();
}));
//#endregion
//#region node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function po(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = po(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function mo() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = po(e)) && (r && (r += " "), r += t);
	return r;
}
var ho = t((() => {}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/shared/attributes.js
function go(e) {
	return typeof e == "object" ? mo(e) : e ?? "";
}
function _o(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || xo.includes(r[o - 1])) && (s === r.length || xo.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function vo(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function yo(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function bo(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(yo)), i && c.push(...Object.keys(i).map(yo));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = yo(e.substring(l, u).trim());
							if (!c.includes(p)) {
								f !== ";" && d++;
								var m = e.substring(l, d).trim();
								n += " " + m + ";";
							}
						}
						l = d + 1, u = -1;
					}
				}
			}
		}
		return r && (n += vo(r)), i && (n += vo(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
var xo, So = t((() => {
	ho(), M(), xo = [..." 	\n\r\f\xA0\v﻿"];
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/elements/class.js
function Co(e, t, n, r, i, a) {
	var o = e[Be];
	if (F || o !== n || o === void 0) {
		var s = _o(n, r, a);
		(!F || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[Be] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
var wo = t((() => {
	So(), N(), xt();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/elements/style.js
function To(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function Eo(e, t, n, r) {
	var i = e[Ve];
	if (F || i !== t) {
		var a = bo(t, r);
		(!F || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[Ve] = t;
	} else r && (Array.isArray(r) ? (To(e, n?.[0], r[0]), To(e, n?.[1], r[1], "important")) : To(e, n, r));
	return r;
}
var Do = t((() => {
	So(), N(), xt();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function Oo(e, t, n = !1) {
	if (e.multiple) {
		if (t == null) return;
		if (!le(t)) return ft();
		for (var r of e.options) r.selected = t.includes(Ao(r));
		return;
	}
	for (r of e.options) if (yr(Ao(r), t)) {
		r.selected = !0;
		return;
	}
	(!n || t !== void 0) && (e.selectedIndex = -1);
}
function ko(e) {
	var t = new MutationObserver(() => {
		Oo(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), Ur(() => {
		t.disconnect();
	});
}
function Ao(e) {
	return "__value" in e ? e.__value : e.value;
}
var jo = t((() => {
	B(), hn(), br(), M(), mt(), ir();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/elements/attributes.js
function Mo(e) {
	if (F) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					Po(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					Po(e, "checked", null), e.checked = r;
				}
			}
		};
		e[Ue] = n, Ht(n), dn();
	}
}
function No(e, t) {
	t ? e.hasAttribute("selected") || e.setAttribute("selected", "") : e.removeAttribute("selected");
}
function Po(e, t, n, r) {
	var i = Lo(e);
	F && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Uo) || i[t] !== (i[t] = n) && (t === "loading" && (e[Re] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Ro(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Fo(e, t, n, r, i = !1, a = !1) {
	if (F && i && e.nodeName === Wo) {
		var o = e;
		(o.type === "checkbox" ? "defaultChecked" : "defaultValue") in n || Mo(o);
	}
	var s = Lo(e), c = s[Vo], l = !s[Ho];
	let u = F && c;
	u && ht(!1);
	var d = t || {}, f = e.nodeName === Go;
	for (var p in t) p in n || (n[p] = null);
	n.class ? n.class = go(n.class) : (r || n[zo]) && (n.class = null), n[Bo] && (n.style ??= null);
	var m = Ro(e);
	if (e.nodeName === Wo && "type" in n && ("value" in n || "__value" in n)) {
		var h = n.type;
		(h !== d.type || h === void 0 && e.hasAttribute("type")) && (d.type = h, Po(e, "type", h, a));
	}
	for (let i in n) {
		let o = n[i];
		if (f && i === "value" && o == null) {
			e.value = e.__value = "", d[i] = o;
			continue;
		}
		if (i === "class") {
			Co(e, e.namespaceURI === "http://www.w3.org/1999/xhtml", o, r, t?.[zo], n[zo]), d[i] = o, d[zo] = n[zo];
			continue;
		}
		if (i === "style") {
			Eo(e, o, t?.[Bo], n[Bo]), d[i] = o, d[Bo] = n[Bo];
			continue;
		}
		var g = d[i];
		if (!(o === g && !(o === void 0 && e.hasAttribute(i)))) {
			d[i] = o;
			var _ = i[0] + i[1];
			if (_ !== "$$") if (_ === "on") {
				let t = {}, n = "$$" + i, r = i.slice(2);
				var v = Wi(r);
				if (Ui(r) && (r = r.slice(0, -7), t.capture = !0), !v && g) {
					if (o != null) continue;
					e.removeEventListener(r, d[n], t), d[n] = null;
				}
				if (v) ra(r, e, o), ia([r]);
				else if (o != null) {
					function a(e) {
						d[i].call(this, e);
					}
					d[n] = ta(r, e, a, t);
				}
			} else if (i === "style") Po(e, i, o);
			else if (i === "autofocus") un(e, !!o);
			else if (!c && (i === "__value" || i === "value" && o != null)) e.value = e.__value = o;
			else if (i === "selected" && f) No(e, o);
			else {
				var y = i;
				l || (y = Gi(y));
				var b = y === "defaultValue" || y === "defaultChecked";
				if (o == null && !c && !b) if (s[i] = null, y === "value" || y === "checked") {
					let n = e, r = t === void 0;
					if (y === "value") {
						let e = n.defaultValue;
						n.removeAttribute(y), n.defaultValue = e, n.value = n.__value = r ? e : null;
					} else {
						let e = n.defaultChecked;
						n.removeAttribute(y), n.defaultChecked = e, n.checked = r ? e : !1;
					}
				} else e.removeAttribute(i);
				else b || m.includes(y) && (c || typeof o != "string") ? (e[y] = o, y in s && (s[y] = st)) : typeof o != "function" && Po(e, y, o, a);
			}
		}
	}
	return u && ht(!0), d;
}
function Io(e, t, n = [], r = [], i = [], a, o = !1, s = !1) {
	Sn(i, n, r, (n) => {
		var r = void 0, i = {}, c = e.nodeName === Ko, l = !1;
		if ($r(() => {
			var u = t(...n.map(V)), d = Fo(e, r, u, a, o, s);
			l && c && "value" in u && Oo(e, u.value);
			for (let e of Object.getOwnPropertySymbols(i)) u[e] || ii(i[e]);
			for (let t of Object.getOwnPropertySymbols(u)) {
				var f = u[t];
				t.description === "@attach" && (!r || f !== r[t]) && (i[t] && ii(i[t]), i[t] = ei(() => uo(e, () => f))), d[t] = f;
			}
			r = d;
		}), c) {
			var u = e;
			Jr(() => {
				Oo(u, r.value, !0), ko(u);
			});
		}
		l = !0;
	});
}
function Lo(e) {
	return e[ze] ??= {
		[Vo]: e.nodeName.includes("-"),
		[Ho]: e.namespaceURI === ct
	};
}
function Ro(e) {
	var t = e.getAttribute("is") || e.nodeName, n = qo.get(t);
	if (n) return n;
	qo.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = me(i), r) r[o].set && o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.push(o);
		i = _e(i);
	}
	return n;
}
var zo, Bo, Vo, Ho, Uo, Wo, Go, Ko, qo, Jo = t((() => {
	A(), xt(), M(), ua(), pn(), mt(), N(), Gt(), Qi(), W(), fo(), So(), wo(), Do(), lt(), B(), jo(), En(), zo = Symbol("class"), Bo = Symbol("style"), Vo = Symbol("is custom element"), Ho = Symbol("is html"), Uo = Ge ? "link" : "LINK", Wo = Ge ? "input" : "INPUT", Go = Ge ? "option" : "OPTION", Ko = Ge ? "select" : "SELECT", qo = /* @__PURE__ */ new Map();
})), Yo = t((() => {
	xt(), Rr(), ma(), fo();
})), Xo = t((() => {
	hn();
})), Zo = t((() => {
	B(), hn(), at(), br(), Gt(), xt(), W(), ir();
})), Qo = t((() => {
	B(), hn();
})), $o = t((() => {
	hn();
})), es = t((() => {
	B(), M();
})), ts = t((() => {
	B(), W();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function ns(e, t) {
	return e === t || e?.[Ie] === t;
}
function rs(e = {}, t, n, r) {
	var i = L.r, a = U;
	return Jr(() => {
		var o, s;
		return Xr(() => {
			o = s, s = r?.() || [], ki(() => {
				ns(n(...s), e) || (t(e, ...s), o && ns(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && ns(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
var is = t((() => {
	N(), Bt(), B(), W();
})), as = t((() => {
	B(), hn();
})), os = t((() => {
	B(), hn();
})), ss = t((() => {
	M(), B(), ua();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/dom/legacy/lifecycle.js
function cs(e = !1) {
	let t = L, n = t.l.u;
	if (!n) return;
	let r = () => Ai(t.s);
	if (e) {
		let e = 0, n = {}, i = /* @__PURE__ */ Dn(() => {
			let r = !1, i = t.s;
			for (let e in i) i[e] !== n[e] && (n[e] = i[e], r = !0);
			return r && e++, e;
		});
		r = () => V(i);
	}
	n.b.length && Kr(() => {
		ls(t, r), se(n.b);
	}), Wr(() => {
		let e = ki(() => n.m.map(oe));
		return () => {
			for (let t of e) typeof t == "function" && t();
		};
	}), n.a.length && Wr(() => {
		ls(t, r), se(n.a);
	});
}
function ls(e, t) {
	if (e.l.s) for (let t of e.l.s) V(t);
	t();
}
var us = t((() => {
	M(), Bt(), In(), B(), W();
})), ds = t((() => {
	gr(), W(), M();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/internal/client/reactivity/props.js
function fs(e, t, n, r) {
	var i = !Ot || (n & 2) != 0, a = (n & 8) != 0, o = (n & 16) != 0, s = r, c = !0, l = void 0, u = () => o && i ? (l ??= /* @__PURE__ */ Dn(r), V(l)) : (c && (c = !1, s = o ? ki(r) : r), s);
	let d;
	if (a) {
		var f = Ie in e || Le in e;
		d = pe(e, t)?.set ?? (f && t in e ? (n) => e[t] = n : void 0);
	}
	var p, m = !1;
	a ? [p, m] = an(() => e[t]) : p = e[t], p === void 0 && r !== void 0 && (p = u(), d && (i && et(t), d(p)));
	var h = i ? () => {
		var n = e[t];
		return n === void 0 ? u() : (c = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (s = void 0), n === void 0 ? s : n;
	};
	if (i && !(n & 4)) return h;
	if (d) {
		var g = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || g || m) && d(t ? h() : e), e) : h();
		});
	}
	var _ = !1, v = (n & 1 ? Dn : kn)(() => (_ = !1, h()));
	a && V(v);
	var y = U;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? V(v) : i && a ? _r(e) : e;
			return cr(v, n), _ = !0, s !== void 0 && (s = n), e;
		}
		return Ni && _ || y.f & 16384 ? v.v : V(v);
	});
}
var ps = t((() => {
	A(), lt(), M(), gr(), In(), W(), at(), N(), br(), cn(), kt(), B();
})), ms = t((() => {
	Bt(), B(), cn(), En();
})), hs = t((() => {
	N(), B(), gr(), Da(), W(), ir(), M(), at(), Bt(), kt(), Qt(), ss();
})), gs = t((() => {
	hs(), B(), ya(), M(), Rr();
})), _s = t((() => {
	N(), At(), W();
})), vs = t((() => {
	Hi(), lt(), Bt(), $i(), ea(), Oa(), ka(), Aa(), jt(), ja(), Ma(), Na(), Ia(), Ra(), za(), Ba(), Za(), Qa(), $a(), to(), no(), oo(), so(), co(), lo(), fo(), Jo(), wo(), ua(), pn(), Yo(), Do(), ao(), Xo(), Zo(), Qo(), $o(), es(), jo(), ts(), is(), as(), os(), xt(), ss(), us(), ds(), ya(), En(), ir(), In(), B(), gr(), ps(), cn(), xn(), pi(), Da(), W(), ms(), ro(), br(), gs(), Rr(), So(), At(), M(), eo(), xr(), _s();
})), ys = t((() => {
	xt(), at();
}));
//#endregion
//#region node_modules/.pnpm/svelte@5.56.7/node_modules/svelte/src/index-client.js
function bs(e) {
	L === null && Ke("onMount"), Ot && L.l !== null ? Ss(L).m.push(e) : Wr(() => {
		let t = ki(e);
		if (typeof t == "function") return t;
	});
}
function xs(e) {
	L === null && Ke("onDestroy"), bs(() => () => ki(e));
}
function Ss(e) {
	var t = e.l;
	return t.u ??= {
		a: [],
		b: [],
		m: []
	};
}
var Cs = t((() => {
	W(), M(), vs(), at(), kt(), Bt(), A(), ir(), ys(), Da(), to();
})), ws = t((() => {})), Ts = t((() => {
	ws(), typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
})), Es = t((() => {
	kt(), Et();
}));
//#endregion
//#region packages/vanilla/src/components/Imperative.svelte
function Ds(e, t) {
	Ft(t, !1);
	let n = Is(), r = zs(), i;
	bs(() => {
		i = r(n);
	}), xs(() => i?.()), cs(), It();
}
var Os = t((() => {
	Ts(), Es(), vs(), Cs(), G();
}));
//#endregion
//#region packages/vanilla/src/runtime/svelte-hydrate.ts
function ks(e) {
	let t = Rs.get(e);
	t && (t(), Rs.delete(e));
}
function As(e) {
	let { key: t, rootSelector: n, Component: r } = e, i = `data-sk-${t}-ready`, a = `data-sk-${t}-mounting`, o = `${n}:not([${i}]):not([${a}])`, s = (e) => {
		if (!(e instanceof HTMLElement) || !e.matches(o)) return null;
		e.setAttribute(a, "true");
		let t = xa(r, {
			target: e,
			context: /* @__PURE__ */ new Map([[Fs, e]])
		});
		Ln(), e.removeAttribute(a), e.setAttribute(i, "true");
		let n = () => {
			Ca(t), e.removeAttribute(i), Rs.delete(e);
		};
		return Rs.set(e, n), {
			root: e,
			destroy: n
		};
	};
	return {
		key: t,
		rootSelector: n,
		pendingSelector: o,
		mountAll: (e = document) => {
			if (typeof document > "u") return [];
			let t = [];
			return e instanceof HTMLElement && e.matches(o) && t.push(e), t.push(...Array.from(e.querySelectorAll(o))), t.map(s).filter((e) => e !== null);
		}
	};
}
function js(e) {
	let t = As(e);
	return (e) => !e && typeof document > "u" ? 0 : t.mountAll(e ?? document).length;
}
function Ms(e) {
	let { rootSelector: t, connect: n } = e, r = "data-sk-ready", i = "data-sk-mounting", a = t.split(",").map((e) => `${e.trim()}:not([${r}]):not([${i}])`).join(", "), o = (e) => {
		if (!(e instanceof HTMLElement) || !e.matches(a)) return !1;
		e.setAttribute(i, "true");
		let t = xa(Ds, {
			target: e,
			context: /* @__PURE__ */ new Map([[Fs, e], [Ls, n]])
		});
		return Ln(), e.removeAttribute(i), e.setAttribute(r, "true"), Rs.set(e, () => {
			Ca(t), e.removeAttribute(r);
		}), !0;
	};
	return (e = document) => {
		if (typeof document > "u") return 0;
		let t = [];
		return e instanceof HTMLElement && e.matches(a) && t.push(e), t.push(...Array.from(e.querySelectorAll(a))), t.filter(o).length;
	};
}
var Ns, Ps, Fs, Is, Ls, Rs, zs, G = t((() => {
	Cs(), Os(), Ns = 0, Ps = (e) => `${e}-${Ns += 1}`, Fs = Symbol("sk-root"), Is = () => {
		let e = Pt(Fs);
		if (!(e instanceof HTMLElement)) throw Error("[ds] getRoot() se llamó fuera del contexto del enhancer; monta con createSvelteEnhancer().");
		return e;
	}, Ls = Symbol("sk-connect"), Rs = /* @__PURE__ */ new WeakMap(), zs = () => {
		let e = Pt(Ls);
		if (typeof e != "function") throw Error("[ds] getConnect() se llamó fuera del contexto de un enhancer imperativo; monta con createConnectMount().");
		return e;
	};
})), Bs = /* @__PURE__ */ n({
	connectButton: () => Vs,
	mountButton: () => Us
});
function Vs(e) {
	let t = e.hasAttribute("disabled") || e.getAttribute("aria-disabled") === "true", n = e.tagName === "A";
	if (n && !e.hasAttribute("href")) throw Error("Button.navigation expects href. Use Button.action for actions.");
	if (n && t) throw Error("Button.navigation cannot be disabled while it has navigation semantics. Render non-link content when the destination is unavailable.");
	if (e.tagName === "BUTTON" && !e.hasAttribute("type") && x(e, { type: "button" }), x(e, { "aria-disabled": t ? "true" : null }), !e.classList.contains(v.root)) throw Error(`Button enhancer expects .${v.root} on the root element.`);
	if (!e.classList.contains(v.interactive)) throw Error(`Button enhancer expects .${v.interactive} on the root element; its state paint and touch target depend on it.`);
	if (e.hasAttribute("data-icon-only") && !(e.hasAttribute("aria-label") || e.hasAttribute("aria-labelledby") || (e.textContent ?? "").trim().length > 0)) throw Error(`Icon-only button (${Hs}[data-icon-only]) has no accessible name. Add aria-label="…" (or aria-labelledby). The icon is decorative, the name is the button's.`);
	return () => {};
}
var Hs, Us, Ws = t((() => {
	b(), k(), G(), Hs = "[data-sk-button]", Us = Ms({
		key: "button",
		rootSelector: Hs,
		connect: Vs
	});
}));
//#endregion
//#region packages/core/src/anchored.ts
function Gs() {
	return typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a");
}
function Ks(e) {
	return `--sk-anchor-${e.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}
function qs(e, t, n) {
	return e.style.setProperty(Qs.name, n), t?.style.setProperty(Qs.name, n), t?.style.setProperty(Qs.boxName, $s(n)), () => {
		e.style.removeProperty(Qs.name), t?.style.removeProperty(Qs.name), t?.style.removeProperty(Qs.boxName);
	};
}
function Js(e) {
	let { style: t, ...n } = e;
	return n;
}
var Ys, Xs, Zs, Qs, $s, ec = t((() => {
	Ys = [
		"block-start",
		"block-end",
		"inline-start",
		"inline-end"
	], Xs = {
		"block-start": "top",
		"block-end": "bottom",
		"inline-start": "left",
		"inline-end": "right"
	}, Zs = {
		anchor: "sk-anchor",
		positioner: "sk-anchored",
		arrow: "sk-anchored-arrow"
	}, Qs = {
		name: "--sk-anchored-name",
		boxName: "--sk-anchored-box-name",
		offset: "--sk-anchored-offset",
		size: "--sk-anchored-size",
		positionArea: "--sk-anchored-position-area",
		positionTry: "--sk-anchored-position-try",
		arrowSize: "--sk-anchored-arrow-size",
		arrowBg: "--sk-anchored-arrow-bg",
		arrowBorderColor: "--sk-anchored-arrow-border-color",
		arrowInset: "--sk-anchored-arrow-inset"
	}, $s = (e) => `${e}-box`;
})), tc, nc, rc, ic = t((() => {
	tc = { valueChange: "sk-value-change" }, nc = {
		native: "sk-select-native",
		root: "sk-select",
		control: "sk-select__control",
		label: "sk-select__label",
		trigger: "sk-select__trigger",
		value: "sk-select__value",
		indicator: "sk-select__indicator",
		positioner: "sk-select__positioner",
		content: "sk-select__content",
		item: "sk-select__item",
		itemText: "sk-select__item-text",
		itemIndicator: "sk-select__item-indicator"
	}, rc = {
		key: "value",
		options: {
			value: {
				type: "string",
				attr: "data-value"
			},
			disabled: {
				type: "boolean",
				default: !1,
				attr: "data-disabled",
				trueValue: ""
			}
		},
		slots: { label: {
			accepts: "text",
			required: !0
		} }
	}, { ...rc }, { ...rc.options.value }, { ...rc.options.disabled };
})), ac, oc, sc, cc = t((() => {
	ac = (e, t = []) => ({
		parts: (...n) => {
			if (sc(t)) return ac(e, n);
			throw Error("createAnatomy().parts(...) should only be called once. Did you mean to use .extendWith(...) ?");
		},
		extendWith: (...n) => ac(e, [...t, ...n]),
		omit: (...n) => ac(e, t.filter((e) => !n.includes(e))),
		rename: (e) => ac(e, t),
		keys: () => t,
		build: () => [...new Set(t)].reduce((t, n) => Object.assign(t, { [n]: {
			selector: [`&[data-scope="${oc(e)}"][data-part="${oc(n)}"]`, `& [data-scope="${oc(e)}"][data-part="${oc(n)}"]`].join(", "),
			attrs: {
				"data-scope": oc(e),
				"data-part": oc(n)
			}
		} }), {})
	}), oc = (e) => e.replace(/([A-Z])([A-Z])/g, "$1-$2").replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase(), sc = (e) => e.length === 0;
})), lc = t((() => {
	cc();
})), uc, dc, fc = t((() => {
	lc(), uc = ac("tabs").parts("root", "list", "trigger", "content", "indicator"), dc = uc.build();
})), pc, mc, hc, gc = t((() => {
	pc = Object.defineProperty, mc = (e, t, n) => t in e ? pc(e, t, {
		enumerable: !0,
		configurable: !0,
		writable: !0,
		value: n
	}) : e[t] = n, hc = (e, t, n) => mc(e, typeof t == "symbol" ? t : t + "", n);
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/caret.mjs
function _c(e) {
	if (e) try {
		if (e.ownerDocument.activeElement !== e) return;
		let t = e.value.length;
		e.setSelectionRange(t, t);
	} catch {}
}
var vc = t((() => {})), yc, bc, xc, Sc, Cc, K, wc, Tc = t((() => {
	yc = (e, t) => e.map((n, r) => e[(Math.max(t, 0) + r) % e.length]), bc = (...e) => (t) => e.reduce((e, t) => t(e), t), xc = () => void 0, Sc = (e) => typeof e == "object" && !!e, Cc = 2147483647, K = (e) => e ? "" : void 0, wc = (e) => e ? "true" : void 0;
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/node.mjs
function Ec(e) {
	return [
		"html",
		"body",
		"#document"
	].includes(Hc(e));
}
function Dc(e) {
	return e ? Nc(e.getRootNode()) === e : !1;
}
function Oc(e) {
	if (e == null || !zc(e)) return !1;
	try {
		return Gc(e) && e.selectionStart != null || Jc.test(e.localName) || e.isContentEditable || e.getAttribute("contenteditable") === "true" || e.getAttribute("contenteditable") === "";
	} catch {
		return !1;
	}
}
function kc(e, t) {
	if (!e || !t || !zc(e) || !Uc(t)) return !1;
	if (zc(t) && e === t || e.contains(t)) return !0;
	let n = t.getRootNode?.();
	if (n && Wc(n)) {
		let n = t;
		for (; n;) {
			if (e === n) return !0;
			n = n.parentNode || n.host;
		}
	}
	return !1;
}
function Ac(e) {
	return Bc(e) ? e : Vc(e) ? e.document : e?.ownerDocument ?? document;
}
function jc(e) {
	return Ac(e).documentElement;
}
function Mc(e) {
	return Wc(e) ? Mc(e.host) : Bc(e) ? e.defaultView ?? window : zc(e) ? e.ownerDocument?.defaultView ?? window : window;
}
function Nc(e) {
	let t = e.activeElement;
	for (; t?.shadowRoot;) {
		let e = t.shadowRoot.activeElement;
		if (!e || e === t) break;
		t = e;
	}
	return t;
}
function Pc(e) {
	if (Hc(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Wc(e) && e.host || jc(e);
	return Wc(t) ? t.host : t;
}
function Fc(e) {
	let t;
	try {
		if (t = e.getRootNode({ composed: !0 }), Bc(t) || Wc(t)) return t;
	} catch {}
	return e.ownerDocument ?? document;
}
var Ic, Lc, Rc, zc, Bc, Vc, Hc, Uc, Wc, Gc, Kc, qc, Jc, Yc = t((() => {
	Tc(), Ic = 1, Lc = 9, Rc = 11, zc = (e) => Sc(e) && e.nodeType === Ic && typeof e.nodeName == "string", Bc = (e) => Sc(e) && e.nodeType === Lc, Vc = (e) => Sc(e) && e === e.window, Hc = (e) => zc(e) ? e.localName || "" : "#document", Uc = (e) => Sc(e) && e.nodeType !== void 0, Wc = (e) => Uc(e) && e.nodeType === Rc && "host" in e, Gc = (e) => zc(e) && e.localName === "input", Kc = (e) => !!e?.matches("a[href]"), qc = (e) => zc(e) ? e.offsetWidth > 0 || e.offsetHeight > 0 || e.getClientRects().length > 0 : !1, Jc = /(textarea|select)/;
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/computed-style.mjs
function Xc(e) {
	return Zc.has(e) || Zc.set(e, Mc(e).getComputedStyle(e)), Zc.get(e);
}
var Zc, Qc = t((() => {
	Yc(), Zc = /* @__PURE__ */ new WeakMap();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/controller.mjs
function $c(e, t) {
	let n = /* @__PURE__ */ new Set(), r = Fc(e), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = nl(e);
			for (let e of a) {
				if (!e || n.has(e)) continue;
				n.add(e);
				let a = r.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					if (e && tl(e) && !n && (a === t || a.contains(t) || i(a))) return !0;
				}
			}
		}
		return !1;
	};
	return i(e);
}
var el, tl, nl, rl = t((() => {
	Yc(), el = /* @__PURE__ */ new Set([
		"menu",
		"listbox",
		"dialog",
		"grid",
		"tree",
		"region",
		"application"
	]), tl = (e) => el.has(e), nl = (e) => e.getAttribute("aria-controls")?.split(" ") || [];
})), il = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/platform.mjs
function al() {
	return navigator.userAgentData?.platform ?? navigator.platform;
}
function ol() {
	let e = navigator.userAgentData;
	return e && Array.isArray(e.brands) ? e.brands.map(({ brand: e, version: t }) => `${e}/${t}`).join(" ") : navigator.userAgent;
}
var sl, cl, ll, ul, dl, fl, pl, ml, hl, gl, _l, vl, yl, bl = t((() => {
	sl = () => typeof document < "u", cl = (e) => sl() && e.test(al()), ll = (e) => sl() && e.test(ol()), ul = (e) => sl() && e.test(navigator.vendor), dl = () => sl() && !!navigator.maxTouchPoints, fl = () => cl(/^iPhone/i), pl = () => cl(/^iPad/i) || gl() && navigator.maxTouchPoints > 1, ml = () => fl() || pl(), hl = () => gl() || ml(), gl = () => cl(/^Mac/i), _l = () => hl() && ul(/apple/i), vl = () => ll(/Firefox/i), yl = () => ll(/Android/i);
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/event.mjs
function xl(e) {
	return e.composedPath?.() ?? e.nativeEvent?.composedPath?.();
}
function Sl(e) {
	return xl(e)?.[0] ?? e.target;
}
function Cl(e) {
	let t = e.currentTarget;
	if (!t || !t.matches("a[href], button[type='submit'], input[type='submit']")) return !1;
	let n = e.button === 1, r = El(e);
	return n || r;
}
function wl(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let n = t.localName;
	return e.altKey ? n === "a" || n === "button" && t.type === "submit" || n === "input" && t.type === "submit" : !1;
}
function Tl(e) {
	return Al(e).isComposing || e.keyCode === 229;
}
function El(e) {
	return gl() ? e.metaKey : e.ctrlKey;
}
function Dl(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
function Ol(e) {
	return e.pointerType === "" && e.isTrusted ? !0 : yl() && e.pointerType ? e.type === "click" && e.buttons === 1 : e.detail === 0 && !e.pointerType;
}
function kl(e, t = {}) {
	let { dir: n = "ltr", orientation: r = "horizontal" } = t, i = e.key;
	return i = Ll[i] ?? i, n === "rtl" && r === "horizontal" && i in Rl && (i = Rl[i]), i;
}
function Al(e) {
	return e.nativeEvent ?? e;
}
function jl(e, t) {
	let { step: n, largeStep: r, smallStep: i } = t, a = Bl.has(e.key);
	return i != null && e.altKey && a ? i : zl.has(e.key) || e.shiftKey && a ? r : n;
}
function Ml(e, t = "client") {
	let n = Il(e) ? e.touches[0] || e.changedTouches[0] : e;
	return {
		x: n[`${t}X`],
		y: n[`${t}Y`]
	};
}
var Nl, Pl, Fl, Il, Ll, Rl, zl, Bl, q, Vl = t((() => {
	bl(), Nl = (e) => e.button === 0, Pl = (e) => e.button === 2 || gl() && e.ctrlKey && e.button === 0, Fl = (e) => e.ctrlKey || e.altKey || e.metaKey, Il = (e) => "touches" in e && e.touches.length > 0, Ll = {
		Up: "ArrowUp",
		Down: "ArrowDown",
		Esc: "Escape",
		" ": "Space",
		",": "Comma",
		Left: "ArrowLeft",
		Right: "ArrowRight"
	}, Rl = {
		ArrowLeft: "ArrowRight",
		ArrowRight: "ArrowLeft"
	}, zl = /* @__PURE__ */ new Set(["PageUp", "PageDown"]), Bl = /* @__PURE__ */ new Set([
		"ArrowUp",
		"ArrowDown",
		"ArrowLeft",
		"ArrowRight"
	]), q = (e, t, n, r) => {
		let i = typeof e == "function" ? e() : e;
		return i?.addEventListener(t, n, r), () => {
			i?.removeEventListener(t, n, r);
		};
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/form.mjs
function Hl(e, t) {
	let { type: n = "HTMLInputElement", property: r = "value" } = t, i = Mc(e)[n].prototype;
	return Object.getOwnPropertyDescriptor(i, r) ?? {};
}
function Ul(e) {
	if (e.localName === "input") return "HTMLInputElement";
	if (e.localName === "textarea") return "HTMLTextAreaElement";
	if (e.localName === "select") return "HTMLSelectElement";
}
function Wl(e, t, n = "value") {
	if (!e) return;
	let r = Ul(e);
	r && Hl(e, {
		type: r,
		property: n
	}).set?.call(e, t), e.setAttribute(n, t);
}
function Gl(e, t) {
	e && (Hl(e, {
		type: "HTMLInputElement",
		property: "checked"
	}).set?.call(e, t), t ? e.setAttribute("checked", "") : e.removeAttribute("checked"));
}
function Kl(e, t) {
	let { checked: n, bubbles: r = !0 } = t;
	if (!e) return;
	let i = Mc(e);
	if (!(e instanceof i.HTMLInputElement)) return;
	Gl(e, n);
	let a = new i.Event("click", { bubbles: r });
	e.dispatchEvent(Ql(a));
}
function ql(e) {
	return e.matches("textarea, input, select, button");
}
function Jl(e, t) {
	if (!e) return;
	let n = ql(e) ? e.form : e.closest("form"), r = (e) => {
		e.defaultPrevented || t();
	};
	return n?.addEventListener("reset", r, { passive: !0 }), () => n?.removeEventListener("reset", r);
}
function Yl(e, t) {
	let n = e?.closest("fieldset");
	if (!n) return;
	t(n.disabled);
	let r = new (Mc(n)).MutationObserver(() => t(n.disabled));
	return r.observe(n, {
		attributes: !0,
		attributeFilter: ["disabled"]
	}), () => r.disconnect();
}
function Xl(e, t) {
	if (!e) return;
	let { onFieldsetDisabledChange: n, onFormReset: r } = t, i = [Jl(e, r), Yl(e, n)];
	return () => i.forEach((e) => e?.());
}
function Zl(e) {
	return Object.prototype.hasOwnProperty.call(e, $l);
}
function Ql(e) {
	return Zl(e) || Object.defineProperty(e, $l, { value: !0 }), e;
}
var $l, eu = t((() => {
	Yc(), $l = /* @__PURE__ */ Symbol.for("zag.changeEvent");
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/tabbable.mjs
function tu(e) {
	let t = e.getAttribute("tabindex");
	return t ? parseInt(t, 10) : NaN;
}
function nu(e) {
	return Gc(e) && e.type === "radio";
}
function ru(e) {
	if (!nu(e) || !e.name || e.checked) return !0;
	let t = `input[type="radio"][name="${CSS.escape(e.name)}"]`, n = e.form ?? e.ownerDocument, r = Array.from(n.querySelectorAll(t)).filter((t) => t.form === e.form && ou(t)), i = r.find((e) => e.checked);
	return i ? i === e : r[0] === e;
}
function iu(e, t) {
	if (!t) return null;
	if (t === !0) return e.shadowRoot || null;
	let n = t(e);
	return (n === !0 ? e.shadowRoot : n) || null;
}
function au(e, t, n) {
	let r = [...e], i = [...e], a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
	e.forEach((e, t) => o.set(e, t));
	let s = 0;
	for (; s < i.length;) {
		let e = i[s++];
		if (!e || a.has(e)) continue;
		a.add(e);
		let c = iu(e, t);
		if (c) {
			let t = Array.from(c.querySelectorAll(fu)).filter(n), a = o.get(e);
			if (a !== void 0) {
				let e = a + 1;
				r.splice(e, 0, ...t), t.forEach((t, n) => {
					o.set(t, e + n);
				});
				for (let n = e + t.length; n < r.length; n++) o.set(r[n], n);
			} else {
				let e = r.length;
				r.push(...t), t.forEach((t, n) => {
					o.set(t, e + n);
				});
			}
			i.push(...t);
		}
	}
	return r;
}
function ou(e) {
	return !zc(e) || e.closest("[inert]") ? !1 : e.matches(fu) && qc(e);
}
function su(e, t = {}) {
	if (!e) return [];
	let { includeContainer: n, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(fu));
	n && cu(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (cu(e)) {
		if (uu(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...su(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	if (r) {
		let e = au(a, r, cu);
		return !e.length && n ? i : e;
	}
	return !a.length && n ? i : a;
}
function cu(e) {
	return zc(e) && e.tabIndex > 0 ? !0 : !ou(e) || du(e) ? !1 : ru(e);
}
function lu(e, t = {}) {
	let n = su(e, t);
	return [n[0] || null, n[n.length - 1] || null];
}
var uu, du, fu, pu, mu = t((() => {
	Yc(), uu = (e) => zc(e) && e.tagName === "IFRAME", du = (e) => tu(e) < 0, fu = "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false']), details > summary:first-of-type", pu = (e, t = {}) => {
		if (!e) return [];
		let { includeContainer: n = !1, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(fu));
		(n == 1 || n == "if-empty" && i.length === 0) && zc(e) && ou(e) && i.unshift(e);
		let a = [];
		for (let e of i) if (ou(e)) {
			if (uu(e) && e.contentDocument) {
				let t = e.contentDocument.body;
				a.push(...pu(t, { getShadowRoot: r }));
				continue;
			}
			a.push(e);
		}
		return r ? au(a, r, ou) : a;
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/initial-focus.mjs
function hu(e) {
	let { root: t, getInitialEl: n, filter: r, enabled: i = !0 } = e;
	if (!i) return;
	let a = null;
	if (a ||= typeof n == "function" ? n() : n, a ||= t?.querySelector("[data-autofocus],[autofocus]"), !a) {
		let e = su(t);
		a = r ? e.filter(r)[0] : e[0];
	}
	return a || t || void 0;
}
function gu(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let [n, r] = lu(t);
	return !(Dc(n) && e.shiftKey || Dc(r) && !e.shiftKey || !n && !r);
}
var _u = t((() => {
	Yc(), mu();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/raf.mjs
function J(e) {
	let t = bu.create();
	return t.request(e), t.cleanup;
}
function vu(e) {
	let t = /* @__PURE__ */ new Set();
	function n(e) {
		let n = globalThis.requestAnimationFrame(e);
		t.add(() => globalThis.cancelAnimationFrame(n));
	}
	return n(() => n(e)), function() {
		t.forEach((e) => e());
	};
}
function yu(e, t, n) {
	let r = J(() => {
		e.removeEventListener(t, i, !0), n();
	}), i = () => {
		r(), n();
	};
	return e.addEventListener(t, i, {
		once: !0,
		capture: !0
	}), r;
}
var bu, xu = t((() => {
	gc(), bu = class e {
		constructor() {
			hc(this, "id", null), hc(this, "fn_cleanup"), hc(this, "cleanup", () => {
				this.cancel();
			});
		}
		static create() {
			return new e();
		}
		request(e) {
			this.cancel(), this.id = globalThis.requestAnimationFrame(() => {
				this.id = null, this.fn_cleanup = e?.();
			});
		}
		cancel() {
			this.id !== null && (globalThis.cancelAnimationFrame(this.id), this.id = null), this.fn_cleanup?.(), this.fn_cleanup = void 0;
		}
		isActive() {
			return this.id !== null;
		}
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/mutation-observer.mjs
function Su(e, t) {
	if (!e) return;
	let { attributes: n, callback: r } = t, i = new (e.ownerDocument.defaultView || window).MutationObserver((e) => {
		for (let t of e) t.type === "attributes" && t.attributeName && n.includes(t.attributeName) && r(t);
	});
	return i.observe(e, {
		attributes: !0,
		attributeFilter: n
	}), () => i.disconnect();
}
function Cu(e, t) {
	let { defer: n } = t, r = n ? J : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(Su(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
function wu(e, t) {
	let { callback: n } = t;
	if (!e) return;
	let r = new (e.ownerDocument.defaultView || window).MutationObserver(n);
	return r.observe(e, {
		childList: !0,
		subtree: !0
	}), () => r.disconnect();
}
function Tu(e, t) {
	let { defer: n } = t, r = n ? J : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(wu(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
var Eu = t((() => {
	xu();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/navigate.mjs
function Du(e) {
	let t = () => {
		let t = Mc(e);
		e.dispatchEvent(new t.MouseEvent("click"));
	};
	vl() ? yu(e, "keyup", t) : queueMicrotask(t);
}
var Ou = t((() => {
	Yc(), bl(), xu();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/overflow.mjs
function ku(e) {
	let t = Pc(e);
	return Ec(t) ? Ac(t).body : zc(t) && ju(t) ? t : ku(t);
}
function Au(e, t = []) {
	let n = ku(e), r = n === e.ownerDocument.body, i = Mc(n);
	return r ? t.concat(i, i.visualViewport || [], ju(n) ? n : []) : t.concat(n, Au(n, []));
}
function ju(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Mc(e).getComputedStyle(e);
	return Mu.test(t + r + n) && !Nu.has(i);
}
var Mu, Nu, Pu = t((() => {
	Yc(), Mu = /auto|scroll|overlay|hidden|clip/, Nu = /* @__PURE__ */ new Set(["inline", "contents"]);
})), Fu = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/pointer-lock.mjs
function Iu(e, t) {
	let n = e.body, r = "pointerLockElement" in e || "mozPointerLockElement" in e, i = () => !!e.pointerLockElement;
	function a() {
		t?.(i());
	}
	function o(n) {
		i() && t?.(!1), console.error("PointerLock error occurred:", n), e.exitPointerLock();
	}
	if (!r) return;
	try {
		n.requestPointerLock();
	} catch {}
	let s = [q(e, "pointerlockchange", a, !1), q(e, "pointerlockerror", o, !1)];
	return () => {
		s.forEach((e) => e()), e.exitPointerLock();
	};
}
var Lu = t((() => {
	Vl();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/text-selection.mjs
function Ru(e = {}) {
	let { target: t, doc: n } = e, r = n ?? document, i = r.documentElement;
	return ml() ? (Vu === "default" && (Hu = i.style.webkitUserSelect, i.style.webkitUserSelect = "none"), Vu = "disabled") : t && (Uu.set(t, t.style.userSelect), t.style.userSelect = "none"), () => zu({
		target: t,
		doc: r
	});
}
function zu(e = {}) {
	let { target: t, doc: n } = e, r = (n ?? document).documentElement;
	if (ml()) {
		if (Vu !== "disabled") return;
		Vu = "restoring", setTimeout(() => {
			vu(() => {
				Vu === "restoring" && (r.style.webkitUserSelect === "none" && (r.style.webkitUserSelect = Hu || ""), Hu = "", Vu = "default");
			});
		}, 300);
	} else if (t && Uu.has(t)) {
		let e = Uu.get(t);
		t.style.userSelect === "none" && (t.style.userSelect = e ?? ""), t.getAttribute("style") === "" && t.removeAttribute("style"), Uu.delete(t);
	}
}
function Bu(e = {}) {
	let { defer: t, target: n, ...r } = e, i = t ? J : (e) => e(), a = [];
	return a.push(i(() => {
		let e = typeof n == "function" ? n() : n;
		a.push(Ru({
			...r,
			target: e
		}));
	})), () => {
		a.forEach((e) => e?.());
	};
}
var Vu, Hu, Uu, Wu = t((() => {
	bl(), xu(), Vu = "default", Hu = "", Uu = /* @__PURE__ */ new WeakMap();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/pointer-move.mjs
function Gu(e, t) {
	let { onPointerMove: n, onPointerUp: r } = t, i = (e) => {
		let t = Ml(e);
		if (!(Math.sqrt(t.x ** 2 + t.y ** 2) < (e.pointerType === "touch" ? 10 : 5))) {
			if (e.pointerType === "mouse" && e.buttons === 0) {
				a(e);
				return;
			}
			n({
				point: t,
				event: e
			});
		}
	}, a = (e) => {
		let t = Ml(e);
		r({
			point: t,
			event: e
		});
	}, o = [
		q(e, "pointermove", i, !1),
		q(e, "pointerup", a, !1),
		q(e, "pointercancel", a, !1),
		q(e, "contextmenu", a, !1),
		Bu({ doc: e })
	];
	return () => {
		o.forEach((e) => e());
	};
}
var Ku = t((() => {
	Vl(), Wu();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/press.mjs
function qu(e) {
	let { pointerNode: t, keyboardNode: n = t, onPress: r, onPressStart: i, onPressEnd: a, isValidKey: o = (e) => e.key === "Enter" } = e;
	if (!t) return xc;
	let s = Mc(t), c = xc, l = xc, u = xc, d = (e) => ({
		point: Ml(e),
		event: e
	});
	function f(e) {
		i?.(d(e));
	}
	function p(e) {
		a?.(d(e));
	}
	c = bc(q(t, "pointerdown", (e) => {
		l(), l = bc(q(s, "pointerup", (e) => {
			let n = Sl(e);
			kc(t, n) ? r?.(d(e)) : a?.(d(e));
		}, {
			passive: !r,
			once: !0
		}), q(s, "pointercancel", p, {
			passive: !a,
			once: !0
		})), Dc(n) && e.pointerType === "mouse" && e.preventDefault(), f(e);
	}, { passive: !i }), q(n, "focus", m));
	function m() {
		u = bc(q(n, "keydown", (e) => {
			o(e) && (l(), l = q(n, "keyup", (e) => {
				if (!o(e)) return;
				let t = new s.PointerEvent("pointerup"), n = d(t);
				r?.(n), a?.(n);
			}), f(new s.PointerEvent("pointerdown")));
		}), q(n, "blur", () => {
			p(new s.PointerEvent("pointercancel"));
		}));
	}
	return () => {
		c(), l(), u();
	};
}
var Ju = t((() => {
	Vl(), Yc(), Tc();
})), Yu = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/query.mjs
function Xu(e, t) {
	return Array.from(e?.querySelectorAll(t) ?? []);
}
function Zu(e, t) {
	return e?.querySelector(t) ?? null;
}
function Qu(e, t, n = nd) {
	return e.find((e) => n(e) === t);
}
function $u(e, t, n = nd) {
	let r = Qu(e, t, n);
	return r ? e.indexOf(r) : -1;
}
function ed(e, t, n = !0) {
	let r = $u(e, t);
	return r = n ? (r + 1) % e.length : Math.min(r + 1, e.length - 1), e[r];
}
function td(e, t, n = !0) {
	let r = $u(e, t);
	return r === -1 ? n ? e[e.length - 1] : null : (r = n ? (r - 1 + e.length) % e.length : Math.max(0, r - 1), e[r]);
}
var nd, rd = t((() => {
	nd = (e) => e.id;
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/resize-observer.mjs
function id(e) {
	let t = /* @__PURE__ */ new WeakMap(), n, r = /* @__PURE__ */ new WeakMap(), i = (e) => n || (n = new e.ResizeObserver((e) => {
		for (let n of e) {
			r.set(n.target, n);
			let e = t.get(n.target);
			if (e) for (let t of e) t(n);
		}
	}), n);
	return {
		observe: (n, r) => {
			let a = t.get(n) || /* @__PURE__ */ new Set();
			a.add(r), t.set(n, a);
			let o = Mc(n);
			return i(o).observe(n, e), () => {
				let e = t.get(n);
				e && (e.delete(r), e.size === 0 && (t.delete(n), i(o).unobserve(n)));
			};
		},
		unobserve: (e) => {
			t.delete(e), n?.unobserve(e);
		}
	};
}
var ad, od = t((() => {
	Yc(), ad = /* @__PURE__ */ id({ box: "border-box" });
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/scale.mjs
function sd(e) {
	let t = e.getBoundingClientRect(), n = e.offsetWidth, r = e.offsetHeight, i = Math.round(t.width) !== n || Math.round(t.height) !== r, a = i ? Math.round(t.width) / n : 1, o = i ? Math.round(t.height) / r : 1;
	return (!a || !Number.isFinite(a)) && (a = 1), (!o || !Number.isFinite(o)) && (o = 1), {
		x: a,
		y: o
	};
}
var cd = t((() => {})), ld = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/scroll.mjs
function ud(e) {
	return e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth;
}
function dd(e, t) {
	let { rootEl: n, ...r } = t || {};
	!e || !n || !ju(n) || !ud(n) || e.scrollIntoView(r);
}
var fd = t((() => {
	Pu();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/searchable.mjs
function pd(e, t, n, r = nd) {
	let i = n ? $u(e, n, r) : -1, a = n ? yc(e, i) : e;
	return t.length === 1 && (a = a.filter((e) => r(e) !== n)), a.find((e) => gd(hd(e), t));
}
var md, hd, gd, _d = t((() => {
	rd(), Tc(), md = (e) => e.split("").map((e) => {
		let t = e.charCodeAt(0);
		return t > 0 && t < 128 ? e : t >= 128 && t <= 255 ? `/x${t.toString(16)}`.replace("/", "\\") : "";
	}).join("").trim(), hd = (e) => md(e.dataset?.valuetext ?? e.textContent ?? ""), gd = (e, t) => e.trim().toLowerCase().startsWith(t.toLowerCase());
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/set.mjs
function vd(e, t, n) {
	let r = e.getAttribute(t), i = r != null;
	return r === n ? xc : (e.setAttribute(t, n), () => {
		i ? e.setAttribute(t, r) : e.removeAttribute(t);
	});
}
function yd(e, t) {
	if (!e) return xc;
	let n = Object.keys(t).reduce((t, n) => (t[n] = e.style.getPropertyValue(n), t), {});
	return bd(n, t) ? xc : (Object.assign(e.style, t), () => {
		Object.assign(e.style, n), e.style.length === 0 && e.removeAttribute("style");
	});
}
function bd(e, t) {
	return Object.keys(e).every((n) => e[n] === t[n]);
}
var xd = t((() => {
	Tc();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/typeahead.mjs
function Sd(e, t) {
	let { state: n, activeId: r, key: i, timeout: a = 350, itemToId: o } = t, s = n.keysSoFar + i, c = s.length > 1 && Array.from(s).every((e) => e === s[0]) ? s[0] : s, l = pd(e.slice(), c, r, o);
	function u() {
		clearTimeout(n.timer), n.timer = -1;
	}
	function d(e) {
		n.keysSoFar = e, u(), e !== "" && (n.timer = +setTimeout(() => {
			d(""), u();
		}, a));
	}
	return d(s), l;
}
function Cd(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
var wd, Td = t((() => {
	_d(), wd = /* @__PURE__ */ Object.assign(Sd, {
		defaultOptions: {
			keysSoFar: "",
			timer: -1
		},
		isValidEvent: Cd
	});
})), Ed = t((() => {})), Dd, Od = t((() => {
	Dd = {
		border: "0",
		clip: "rect(0 0 0 0)",
		height: "1px",
		margin: "-1px",
		overflow: "hidden",
		padding: "0",
		position: "absolute",
		width: "1px",
		whiteSpace: "nowrap",
		wordWrap: "normal"
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dom-query@1.42.0/node_modules/@zag-js/dom-query/dist/wait-for.mjs
function kd(e, t, n) {
	let { signal: r } = t;
	return [new Promise((t, i) => {
		let a = setTimeout(() => {
			i(/* @__PURE__ */ Error(`Timeout of ${n}ms exceeded`));
		}, n);
		r.addEventListener("abort", () => {
			clearTimeout(a), i(new DOMException("Promise aborted", "AbortError"));
		}), e.then((e) => {
			r.aborted || (clearTimeout(a), t(e));
		}).catch((e) => {
			r.aborted || (clearTimeout(a), i(e));
		});
	}), () => t.abort()];
}
function Ad(e, t) {
	let { timeout: n, rootNode: r } = t, i = Mc(r), a = Ac(r), o = new i.AbortController();
	return kd(new Promise((t) => {
		let n = e();
		if (n) {
			t(n);
			return;
		}
		let r = new i.MutationObserver(() => {
			let n = e();
			n && n.isConnected && (r.disconnect(), t(n));
		});
		r.observe(a.body, {
			childList: !0,
			subtree: !0
		});
	}), o, n);
}
var jd = t((() => {
	Yc();
})), Y = t((() => {
	vc(), Qc(), rl(), il(), Vl(), eu(), _u(), Eu(), Ou(), Yc(), Pu(), bl(), Fu(), Lu(), Ku(), Ju(), Yu(), rd(), xu(), od(), cd(), ld(), fd(), _d(), xd(), Tc(), mu(), Wu(), Td(), Ed(), Od(), jd();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+utils@1.42.0/node_modules/@zag-js/utils/dist/array.mjs
function Md(e) {
	return e == null ? [] : Array.isArray(e) ? e : [e];
}
function Nd(e, t, n = {}) {
	let { step: r = 1, loop: i = !0 } = n, a = t + r, o = e.length, s = o - 1;
	return t === -1 ? r > 0 ? 0 : s : a < 0 ? i ? s : 0 : a >= o ? i ? 0 : t > o ? o : t : a;
}
function Pd(e, t, n = {}) {
	return e[Nd(e, t, n)];
}
function Fd(e, t, n = {}) {
	let { step: r = 1, loop: i = !0 } = n;
	return Nd(e, t, {
		step: -r,
		loop: i
	});
}
function Id(e, t, n = {}) {
	return e[Fd(e, t, n)];
}
function Ld(e, t) {
	return e.reduce((e, n, r) => (r % t === 0 ? e.push([n]) : Vd(e)?.push(n), e), []);
}
function Rd(e) {
	return e.reduce((e, t) => Array.isArray(t) ? e.concat(Rd(t)) : e.concat(t), []);
}
function zd(e, t) {
	return e.reduce(([e, n], r) => (t(r) ? e.push(r) : n.push(r), [e, n]), [[], []]);
}
var Bd, Vd, Hd, Ud, Wd, Gd, Kd, qd, Jd = t((() => {
	Bd = (e) => e[0], Vd = (e) => e[e.length - 1], Hd = (e, t) => e.indexOf(t) !== -1, Ud = (e, ...t) => e.concat(t), Wd = (e, ...t) => e.filter((e) => !t.includes(e)), Gd = (e) => Array.from(new Set(e)), Kd = (e, t) => {
		let n = new Set(t);
		return e.filter((e) => !n.has(e));
	}, qd = (e, t) => Hd(e, t) ? Wd(e, t) : Ud(e, t);
})), Yd, Xd, Zd, Qd = t((() => {
	Yd = (e) => e?.constructor.name === "Array", Xd = (e, t) => {
		if (e.length !== t.length) return !1;
		for (let n = 0; n < e.length; n++) if (!Zd(e[n], t[n])) return !1;
		return !0;
	}, Zd = (e, t) => {
		if (Object.is(e, t)) return !0;
		if (e == null && t != null || e != null && t == null) return !1;
		if (typeof e?.isEqual == "function" && typeof t?.isEqual == "function") return e.isEqual(t);
		if (typeof e == "function" && typeof t == "function") return e.toString() === t.toString();
		if (Yd(e) && Yd(t)) return Xd(Array.from(e), Array.from(t));
		if (typeof e != "object" || typeof t != "object") return !1;
		let n = Object.keys(t ?? /* @__PURE__ */ Object.create(null)), r = n.length;
		for (let t = 0; t < r; t++) if (!Reflect.has(e, n[t])) return !1;
		for (let i = 0; i < r; i++) {
			let r = n[i];
			if (!Zd(e[r], t[r])) return !1;
		}
		return !0;
	};
})), $d, ef, tf, nf, rf, af, of, sf, cf, lf, uf, df, ff, pf, mf, hf = t((() => {
	$d = (e) => Array.isArray(e), ef = (e) => e === !0 || e === !1, tf = (e) => typeof e == "object" && !!e, nf = (e) => tf(e) && !$d(e), rf = (e) => typeof e == "string", af = (e) => typeof e == "function", of = (e) => e == null, sf = (e, t) => Object.prototype.hasOwnProperty.call(e, t), cf = (e) => Object.prototype.toString.call(e), lf = Function.prototype.toString, uf = lf.call(Object), df = (e) => {
		if (!tf(e) || cf(e) != "[object Object]" || mf(e)) return !1;
		let t = Object.getPrototypeOf(e);
		if (t === null) return !0;
		let n = sf(t, "constructor") && t.constructor;
		return typeof n == "function" && n instanceof n && lf.call(n) == uf;
	}, ff = (e) => typeof e == "object" && !!e && "$$typeof" in e && "props" in e, pf = (e) => typeof e == "object" && !!e && "__v_isVNode" in e, mf = (e) => ff(e) || pf(e);
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+utils@1.42.0/node_modules/@zag-js/utils/dist/functions.mjs
function gf(e, t, ...n) {
	if (e in t) {
		let r = t[e];
		return af(r) ? r(...n) : r;
	}
	let r = /* @__PURE__ */ Error(`No matching key: ${JSON.stringify(e)} in ${JSON.stringify(Object.keys(t))}`);
	throw Error.captureStackTrace?.(r, gf), r;
}
function _f(e, t = 0) {
	let n = 0, r = null;
	return ((...i) => {
		let a = Date.now(), o = a - n;
		o >= t ? (r &&= (clearTimeout(r), null), e(...i), n = a) : r ||= setTimeout(() => {
			e(...i), n = Date.now(), r = null;
		}, t - o);
	});
}
function vf(e) {
	let t = "", n;
	for (n = Math.abs(e); n > 52; n = n / 52 | 0) t = wf(n % 52) + t;
	return wf(n % 52) + t;
}
function yf(e, t) {
	let n = t.length;
	for (; n;) e = e * 33 ^ t.charCodeAt(--n);
	return e;
}
var bf, xf, Sf, Cf, wf, Tf, Ef = t((() => {
	hf(), bf = (e) => e, xf = (e) => e(), Sf = () => {}, Cf = (...e) => (...t) => {
		e.forEach(function(e) {
			e?.(...t);
		});
	}, wf = (e) => String.fromCharCode(e + (e > 25 ? 39 : 97)), Tf = (e) => vf(yf(5381, e) >>> 0);
})), Df, Of, kf, Af, jf, Mf, Nf, Pf, Ff, If, Lf, Rf, zf, Bf, Vf, Hf, Uf, Wf, Gf, Kf, qf = t((() => {
	({floor: Df, abs: Of, round: kf, min: Af, max: jf, pow: Mf, sign: Nf} = Math), Pf = (e) => Number.isNaN(e), Ff = (e) => Pf(e) ? 0 : e, If = (e, t) => (e % t + t) % t, Lf = (e, t) => Ff(e) >= t, Rf = (e, t) => Ff(e) <= t, zf = (e, t, n) => {
		let r = Ff(e);
		return (t == null || r >= t) && (n == null || r <= n);
	}, Bf = (e, t, n) => Af(jf(Ff(e), t), n), Vf = (e, t) => typeof t == "number" ? Df(e * t + .5) / t : kf(e), Hf = (e) => {
		if (!Number.isFinite(e)) return 0;
		let t = 1, n = 0;
		for (; Math.round(e * t) / t !== e;) t *= 10, n += 1;
		return n;
	}, Uf = (e, t, n) => {
		let r = t === "+" ? e + n : e - n;
		if (e % 1 != 0 || n % 1 != 0) {
			let i = 10 ** Math.max(Hf(e), Hf(n));
			e = Math.round(e * i), n = Math.round(n * i), r = t === "+" ? e + n : e - n, r /= i;
		}
		return r;
	}, Wf = (e, t) => Uf(Ff(e), "+", t), Gf = (e, t) => Uf(Ff(e), "-", t), Kf = (e) => typeof e == "number" ? `${e}px` : e;
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+utils@1.42.0/node_modules/@zag-js/utils/dist/object.mjs
function Jf(e) {
	if (!df(e) || e === void 0) return e;
	let t = Reflect.ownKeys(e).filter((e) => typeof e == "string"), n = {};
	for (let r of t) {
		let t = e[r];
		t !== void 0 && (n[r] = Jf(t));
	}
	return n;
}
var Yf = t((() => {
	hf();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+utils@1.42.0/node_modules/@zag-js/utils/dist/store.mjs
function Xf(e, t = Object.is) {
	let n = { ...e }, r = /* @__PURE__ */ new Set(), i = (e) => (r.add(e), () => r.delete(e)), a = () => {
		r.forEach((e) => e());
	};
	return {
		subscribe: i,
		get: (e) => n[e],
		set: (e, r) => {
			t(n[e], r) || (n[e] = r, a());
		},
		update: (e) => {
			let r = !1;
			for (let i in e) {
				let a = e[i];
				a !== void 0 && !t(n[i], a) && (n[i] = a, r = !0);
			}
			r && a();
		},
		snapshot: () => ({ ...n })
	};
}
var Zf = t((() => {})), Qf = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+utils@1.42.0/node_modules/@zag-js/utils/dist/warning.mjs
function $f(...e) {
	let t = e.length === 1 ? e[0] : e[1];
	(e.length !== 2 || e[0]) && process.env.NODE_ENV !== "production" && console.warn(t);
}
function ep(...e) {
	let t = e.length === 1 ? e[0] : e[1];
	if ((e.length !== 2 || e[0]) && process.env.NODE_ENV !== "production") throw Error(t);
}
function tp(e, t) {
	if (e == null) throw Error(t());
}
function np(e, t, n) {
	let r = [];
	for (let n of t) e[n] ?? r.push(n);
	if (r.length > 0) throw Error(`[zag-js${n ? ` > ${n}` : ""}] missing required props: ${r.join(", ")}`);
}
var rp = t((() => {})), X = t((() => {
	Jd(), Qd(), Ef(), hf(), qf(), Yf(), Zf(), Qf(), rp();
})), ip, ap, op, sp, cp, lp, up, dp, fp, pp, mp, hp, gp, _p, vp, yp, bp = t((() => {
	Y(), X(), ip = (e) => e.ids?.root ?? `tabs:${e.id}`, ap = (e) => e.ids?.list ?? `tabs:${e.id}:list`, op = (e, t) => e.ids?.content?.(t) ?? `tabs:${e.id}:content-${t}`, sp = (e, t) => e.ids?.trigger?.(t) ?? `tabs:${e.id}:trigger-${t}`, cp = (e) => e.ids?.indicator ?? `tabs:${e.id}:indicator`, lp = (e) => e.getById(ap(e)), up = (e, t) => e.getById(op(e, t)), dp = (e, t) => t == null ? null : e.getById(sp(e, t)), fp = (e) => e.getById(cp(e)), pp = (e) => {
		let t = `[role=tab][data-ownedby='${CSS.escape(ap(e))}']:not([disabled])`;
		return Xu(lp(e), t);
	}, mp = (e) => Bd(pp(e)), hp = (e) => Vd(pp(e)), gp = (e, t) => ed(pp(e), sp(e, t.value), t.loopFocus), _p = (e, t) => td(pp(e), sp(e, t.value), t.loopFocus), vp = (e) => ({
		x: e?.offsetLeft ?? 0,
		y: e?.offsetTop ?? 0,
		width: e?.offsetWidth ?? 0,
		height: e?.offsetHeight ?? 0
	}), yp = (e, t) => vp(Qu(pp(e), sp(e, t)));
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+tabs@1.42.0/node_modules/@zag-js/tabs/dist/tabs.connect.mjs
function xp(e, t) {
	let { state: n, send: r, context: i, prop: a, scope: o } = e, s = a("translations"), c = n.matches("focused"), l = a("orientation") === "vertical", u = a("orientation") === "horizontal", d = a("composite");
	function f(e) {
		return {
			selected: i.get("value") === e.value,
			focused: i.get("focusedValue") === e.value,
			disabled: !!e.disabled
		};
	}
	return {
		value: i.get("value"),
		focusedValue: i.get("focusedValue"),
		setValue(e) {
			r({
				type: "SET_VALUE",
				value: e
			});
		},
		clearValue() {
			r({ type: "CLEAR_VALUE" });
		},
		setIndicatorRect(e) {
			let t = sp(o, e);
			r({
				type: "SET_INDICATOR_RECT",
				id: t
			});
		},
		syncTabIndex() {
			r({ type: "SYNC_TAB_INDEX" });
		},
		selectNext(e) {
			r({
				type: "TAB_FOCUS",
				value: e,
				src: "selectNext"
			}), r({
				type: "ARROW_NEXT",
				src: "selectNext"
			});
		},
		selectPrev(e) {
			r({
				type: "TAB_FOCUS",
				value: e,
				src: "selectPrev"
			}), r({
				type: "ARROW_PREV",
				src: "selectPrev"
			});
		},
		focus() {
			let e = i.get("value");
			e && dp(o, e)?.focus();
		},
		getRootProps() {
			return t.element({
				...dc.root.attrs,
				id: ip(o),
				"data-orientation": a("orientation"),
				"data-focus": K(c),
				dir: a("dir")
			});
		},
		getListProps() {
			return t.element({
				...dc.list.attrs,
				id: ap(o),
				role: "tablist",
				dir: a("dir"),
				"data-focus": K(c),
				"aria-orientation": a("orientation"),
				"data-orientation": a("orientation"),
				"aria-label": s?.listLabel,
				onKeyDown(e) {
					if (e.defaultPrevented || Tl(e) || !kc(e.currentTarget, Sl(e))) return;
					let t = {
						ArrowDown() {
							u || r({
								type: "ARROW_NEXT",
								key: "ArrowDown"
							});
						},
						ArrowUp() {
							u || r({
								type: "ARROW_PREV",
								key: "ArrowUp"
							});
						},
						ArrowLeft() {
							l || r({
								type: "ARROW_PREV",
								key: "ArrowLeft"
							});
						},
						ArrowRight() {
							l || r({
								type: "ARROW_NEXT",
								key: "ArrowRight"
							});
						},
						Home() {
							r({ type: "HOME" });
						},
						End() {
							r({ type: "END" });
						}
					}[kl(e, {
						dir: a("dir"),
						orientation: a("orientation")
					})];
					if (t) {
						e.preventDefault(), t(e);
						return;
					}
				}
			});
		},
		getTriggerState: f,
		getTriggerProps(e) {
			let { value: n, disabled: s } = e, c = f(e);
			return t.button({
				...dc.trigger.attrs,
				role: "tab",
				type: "button",
				disabled: s,
				dir: a("dir"),
				"data-orientation": a("orientation"),
				"data-disabled": K(s),
				"aria-disabled": s,
				"data-value": n,
				"aria-selected": c.selected,
				"data-selected": K(c.selected),
				"data-focus": K(c.focused),
				"aria-controls": c.selected ? op(o, n) : void 0,
				"data-ownedby": ap(o),
				"data-ssr": K(i.get("ssr")),
				id: sp(o, n),
				tabIndex: c.selected && d ? 0 : -1,
				onFocus() {
					r({
						type: "TAB_FOCUS",
						value: n
					});
				},
				onBlur(e) {
					e.relatedTarget?.getAttribute("role") !== "tab" && r({ type: "TAB_BLUR" });
				},
				onClick(e) {
					e.defaultPrevented || Cl(e) || s || (_l() && e.currentTarget.focus(), r({
						type: "TAB_CLICK",
						value: n
					}));
				}
			});
		},
		getContentProps(e) {
			let { value: n } = e, r = i.get("value") === n;
			return t.element({
				...dc.content.attrs,
				dir: a("dir"),
				id: op(o, n),
				tabIndex: d ? 0 : -1,
				"aria-labelledby": sp(o, n),
				role: "tabpanel",
				"data-ownedby": ap(o),
				"data-selected": K(r),
				"data-orientation": a("orientation"),
				hidden: !r
			});
		},
		getIndicatorProps() {
			let e = i.get("indicatorRect"), n = i.get("animateIndicator");
			return t.element({
				id: cp(o),
				...dc.indicator.attrs,
				dir: a("dir"),
				"data-orientation": a("orientation"),
				hidden: Sp(e),
				onTransitionEnd(e) {
					Sl(e) === e.currentTarget && r({ type: "INDICATOR_TRANSITION_END" });
				},
				style: {
					"--transition-property": "left, right, top, bottom, width, height",
					"--left": Kf(e?.x),
					"--top": Kf(e?.y),
					"--width": Kf(e?.width),
					"--height": Kf(e?.height),
					position: "absolute",
					willChange: n ? "var(--transition-property)" : "auto",
					transitionProperty: n ? "var(--transition-property)" : "none",
					transitionDuration: n ? "var(--transition-duration, 150ms)" : "0ms",
					transitionTimingFunction: "var(--transition-timing-function)",
					[u ? "left" : "top"]: u ? "var(--left)" : "var(--top)"
				}
			});
		}
	};
}
var Sp, Cp = t((() => {
	Y(), X(), fc(), bp(), Sp = (e) => e == null || e.width === 0 && e.height === 0 && e.x === 0 && e.y === 0;
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+core@1.42.0/node_modules/@zag-js/core/dist/merge-props.mjs
function wp(...e) {
	let t = {};
	for (let n of e) {
		if (!n) continue;
		for (let e in t) {
			if (e.startsWith("on") && typeof t[e] == "function" && typeof n[e] == "function") {
				t[e] = Cf(n[e], t[e]);
				continue;
			}
			if (e === "className" || e === "class") {
				t[e] = Tp(t[e], n[e]);
				continue;
			}
			if (e === "style") {
				t[e] = Op(t[e], n[e]);
				continue;
			}
			t[e] = n[e] === void 0 ? t[e] : n[e];
		}
		for (let e in n) t[e] === void 0 && (t[e] = n[e]);
		let e = Object.getOwnPropertySymbols(n);
		for (let r of e) t[r] = n[r];
	}
	return t;
}
var Tp, Ep, Dp, Op, kp = t((() => {
	X(), Tp = (...e) => e.map((e) => e?.trim?.()).filter(Boolean).join(" "), Ep = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g, Dp = (e) => {
		let t = {}, n;
		for (; n = Ep.exec(e);) t[n[1]] = n[2];
		return t;
	}, Op = (e, t) => {
		if (rf(e)) {
			if (rf(t)) return `${e};${t}`;
			e = Dp(e);
		} else rf(t) && (t = Dp(t));
		return Object.assign({}, e ?? {}, t ?? {});
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+core@1.42.0/node_modules/@zag-js/core/dist/memo.mjs
function Ap(e, t, n) {
	let r = [], i;
	return (a) => {
		let o = e(a);
		return o.length !== r.length || o.some((e, t) => !Zd(r[t], e)) ? (r = o, i = t(o, a), n?.onChange?.(i), i) : i;
	};
}
var jp = t((() => {
	X();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+core@1.42.0/node_modules/@zag-js/core/dist/state.mjs
function Mp(e) {
	return e.join(Xp);
}
function Np(e) {
	return e.includes(Xp);
}
function Pp(e) {
	return e.startsWith(Zp);
}
function Fp(e) {
	return e.startsWith(Xp);
}
function Ip(e) {
	return Pp(e) ? e.slice(Zp.length) : e;
}
function Lp(e, t) {
	return e ? `${e}${Xp}${t}` : t;
}
function Rp(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = (e, i) => {
		t.set(e, i);
		let a = i.id;
		a && (n.has(a) && ep(`[zag-js] Duplicate state id: "${a}"`), n.set(a, e));
		let o = i.states;
		if (o) {
			tp(i.initial, () => `[zag-js] Compound state "${e}" has child states but no "initial" property`), i.initial in o || ep(`[zag-js] Compound state "${e}" has initial "${String(i.initial)}" which is not a child state`);
			for (let [t, n] of Object.entries(o)) {
				if (!n) continue;
				let i = Lp(e, t);
				r(i, n);
			}
		}
	};
	for (let [t, n] of Object.entries(e.states)) n && r(t, n);
	return {
		index: t,
		idIndex: n
	};
}
function zp(e) {
	let t = Qp.get(e);
	if (t) return t;
	let { index: n, idIndex: r } = Rp(e);
	return Qp.set(e, n), $p.set(e, r), n;
}
function Bp(e, t) {
	return zp(e), $p.get(e)?.get(t);
}
function Vp(e) {
	return e ? String(e).split(Xp).filter(Boolean) : [];
}
function Hp(e, t) {
	if (!t) return [];
	let n = zp(e), r = Vp(t), i = [], a = [];
	for (let e of r) {
		a.push(e);
		let t = Mp(a), r = n.get(t);
		if (!r) break;
		i.push({
			path: t,
			state: r
		});
	}
	return i;
}
function Up(e, t) {
	let n = zp(e), r = Vp(t);
	if (!r.length) return t;
	let i = [];
	for (let e of r) {
		i.push(e);
		let r = Mp(i);
		if (!n.has(r)) return t;
	}
	let a = Mp(i), o = n.get(a);
	for (; o?.initial;) {
		let e = `${a}${Xp}${o.initial}`, t = n.get(e);
		if (!t) break;
		a = e, o = t;
	}
	return a;
}
function Wp(e, t) {
	return zp(e).has(t);
}
function Gp(e, t, n) {
	let r = String(t);
	if (Pp(r)) {
		let t = Ip(r), n = Bp(e, t);
		return tp(n, () => `[zag-js] Unknown state id: "${t}"`), Up(e, n);
	}
	if (Fp(r) && n) return Up(e, Lp(n, r.slice(1)));
	if (!Np(r) && n) {
		let t = Vp(n);
		for (let n = t.length - 1; n >= 1; n--) {
			let i = Lp(t.slice(0, n).join(Xp), r);
			if (Wp(e, i)) return Up(e, i);
		}
		if (Wp(e, r)) return Up(e, r);
	}
	return Up(e, r);
}
function Kp(e, t, n) {
	let r = Hp(e, t);
	for (let e = r.length - 1; e >= 0; e--) {
		let t = r[e]?.state.on?.[n];
		if (t) return {
			transitions: t,
			source: r[e]?.path
		};
	}
	return {
		transitions: e.on?.[n],
		source: void 0
	};
}
function qp(e, t, n, r) {
	let i = t ? Hp(e, t) : [], a = Hp(e, n), o = 0;
	for (; o < i.length && o < a.length && i[o]?.path === a[o]?.path;) o += 1;
	let s = i.slice(o).reverse(), c = a.slice(o), l = i.at(-1)?.path === a.at(-1)?.path;
	return r && l && (s = i.slice().reverse(), c = a), {
		exiting: s,
		entering: c
	};
}
function Jp(e, t) {
	return e ? e === t || e.startsWith(`${t}${Xp}`) : !1;
}
function Yp(e, t, n) {
	return Hp(e, t).some((e) => e.state.tags?.includes(n));
}
var Xp, Zp, Qp, $p, em = t((() => {
	X(), Xp = ".", Zp = "#", Qp = /* @__PURE__ */ new WeakMap(), $p = /* @__PURE__ */ new WeakMap();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+core@1.42.0/node_modules/@zag-js/core/dist/create-machine.mjs
function tm() {
	return {
		and: (...e) => function(t) {
			return e.every((e) => t.guard(e));
		},
		or: (...e) => function(t) {
			return e.some((e) => t.guard(e));
		},
		not: (e) => function(t) {
			return !t.guard(e);
		}
	};
}
function nm(e) {
	return zp(e), e;
}
function rm() {
	return {
		guards: tm(),
		createMachine: (e) => nm(e),
		choose: (e) => function({ choose: t }) {
			return t(e)?.actions;
		}
	};
}
var im = t((() => {
	em();
})), am, om, sm = t((() => {
	am = /* @__PURE__ */ ((e) => (e.NotStarted = "Not Started", e.Started = "Started", e.Stopped = "Stopped", e))(am || {}), om = "__init__";
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+core@1.42.0/node_modules/@zag-js/core/dist/scope.mjs
function cm(e) {
	let t = () => e.getRootNode?.() ?? document, n = () => Ac(t()), r = () => n().defaultView ?? window, i = () => Nc(t()), a = (e) => t().getElementById(e);
	return {
		...e,
		getRootNode: t,
		getDoc: n,
		getWin: r,
		getActiveElement: i,
		isActiveElement: Dc,
		getById: a
	};
}
var lm = t((() => {
	Y();
})), um = t((() => {
	kp(), jp(), im(), em(), sm(), lm();
})), dm, fm, pm = t((() => {
	um(), Y(), X(), bp(), {createMachine: dm} = rm(), fm = dm({
		props({ props: e }) {
			return {
				dir: "ltr",
				orientation: "horizontal",
				activationMode: "automatic",
				loopFocus: !0,
				composite: !0,
				navigate(e) {
					Du(e.node);
				},
				defaultValue: null,
				...e
			};
		},
		initialState() {
			return "idle";
		},
		context({ prop: e, bindable: t }) {
			return {
				value: t(() => ({
					defaultValue: e("defaultValue"),
					value: e("value"),
					onChange(t) {
						e("onValueChange")?.({ value: t });
					}
				})),
				focusedValue: t(() => ({
					defaultValue: e("value") || e("defaultValue"),
					sync: !0,
					onChange(t) {
						e("onFocusChange")?.({ focusedValue: t });
					}
				})),
				ssr: t(() => ({ defaultValue: !0 })),
				indicatorRect: t(() => ({ defaultValue: null })),
				animateIndicator: t(() => ({ defaultValue: !1 }))
			};
		},
		refs() {
			return {
				indicatorCleanup: null,
				prevValue: null
			};
		},
		watch({ context: e, prop: t, track: n, action: r }) {
			n([() => e.get("value")], () => {
				r([
					"syncIndicatorAnimation",
					"syncIndicatorRect",
					"syncTabIndex",
					"navigateIfNeeded"
				]);
			}), n([() => t("dir"), () => t("orientation")], () => {
				r(["syncIndicatorRect"]);
			});
		},
		on: {
			SET_VALUE: { actions: ["setValue"] },
			CLEAR_VALUE: { actions: ["clearValue"] },
			SET_INDICATOR_RECT: { actions: ["setIndicatorRect"] },
			SYNC_TAB_INDEX: { actions: ["syncTabIndex"] },
			INDICATOR_TRANSITION_END: { actions: ["clearIndicatorAnimation"] }
		},
		entry: [
			"syncPrevValue",
			"syncIndicatorRect",
			"syncTabIndex",
			"syncSsr"
		],
		exit: ["cleanupObserver"],
		states: {
			idle: { on: {
				TAB_FOCUS: {
					target: "focused",
					actions: ["setFocusedValue"]
				},
				TAB_CLICK: {
					target: "focused",
					actions: ["setFocusedValue", "setValue"]
				}
			} },
			focused: { on: {
				TAB_CLICK: { actions: ["setFocusedValue", "setValue"] },
				ARROW_PREV: [{
					guard: "selectOnFocus",
					actions: ["focusPrevTab", "selectFocusedTab"]
				}, { actions: ["focusPrevTab"] }],
				ARROW_NEXT: [{
					guard: "selectOnFocus",
					actions: ["focusNextTab", "selectFocusedTab"]
				}, { actions: ["focusNextTab"] }],
				HOME: [{
					guard: "selectOnFocus",
					actions: ["focusFirstTab", "selectFocusedTab"]
				}, { actions: ["focusFirstTab"] }],
				END: [{
					guard: "selectOnFocus",
					actions: ["focusLastTab", "selectFocusedTab"]
				}, { actions: ["focusLastTab"] }],
				TAB_FOCUS: { actions: ["setFocusedValue"] },
				TAB_BLUR: {
					target: "idle",
					actions: ["clearFocusedValue"]
				}
			} }
		},
		implementations: {
			guards: { selectOnFocus: ({ prop: e }) => e("activationMode") === "automatic" },
			actions: {
				selectFocusedTab({ context: e, prop: t }) {
					J(() => {
						let n = e.get("focusedValue");
						if (!n) return;
						let r = t("deselectable") && e.get("value") === n ? null : n;
						e.set("value", r);
					});
				},
				setFocusedValue({ context: e, event: t, flush: n }) {
					t.value != null && n(() => {
						e.set("focusedValue", t.value);
					});
				},
				clearFocusedValue({ context: e }) {
					e.set("focusedValue", null);
				},
				setValue({ context: e, event: t, prop: n }) {
					let r = n("deselectable") && e.get("value") === e.get("focusedValue");
					e.set("value", r ? null : t.value);
				},
				clearValue({ context: e }) {
					e.set("value", null);
				},
				focusFirstTab({ scope: e }) {
					J(() => {
						mp(e)?.focus();
					});
				},
				focusLastTab({ scope: e }) {
					J(() => {
						hp(e)?.focus();
					});
				},
				focusNextTab({ context: e, prop: t, scope: n, event: r }) {
					let i = r.value ?? e.get("focusedValue");
					if (!i) return;
					let a = gp(n, {
						value: i,
						loopFocus: t("loopFocus")
					});
					J(() => {
						t("composite") ? a?.focus() : a?.dataset.value != null && e.set("focusedValue", a.dataset.value);
					});
				},
				focusPrevTab({ context: e, prop: t, scope: n, event: r }) {
					let i = r.value ?? e.get("focusedValue");
					if (!i) return;
					let a = _p(n, {
						value: i,
						loopFocus: t("loopFocus")
					});
					J(() => {
						t("composite") ? a?.focus() : a?.dataset.value != null && e.set("focusedValue", a.dataset.value);
					});
				},
				syncTabIndex({ context: e, scope: t }) {
					J(() => {
						let n = e.get("value");
						if (!n) return;
						let r = up(t, n);
						r && (pu(r).length > 0 ? r.removeAttribute("tabindex") : r.setAttribute("tabindex", "0"));
					});
				},
				cleanupObserver({ refs: e }) {
					let t = e.get("indicatorCleanup");
					t && t();
				},
				setIndicatorRect({ context: e, event: t, scope: n }) {
					let r = t.id ?? e.get("value");
					fp(n) && r && dp(n, r) && e.set("indicatorRect", yp(n, r));
				},
				syncSsr({ context: e }) {
					e.set("ssr", !1);
				},
				syncPrevValue({ context: e, refs: t }) {
					t.set("prevValue", e.get("value"));
				},
				syncIndicatorAnimation({ context: e, refs: t }) {
					let n = t.get("prevValue"), r = e.get("value"), i = n != null && r != null && n !== r;
					e.set("animateIndicator", i), t.set("prevValue", r);
				},
				clearIndicatorAnimation({ context: e }) {
					e.set("animateIndicator", !1);
				},
				syncIndicatorRect({ context: e, refs: t, scope: n }) {
					let r = t.get("indicatorCleanup");
					if (r && r(), !fp(n)) return;
					let i = () => {
						let t = dp(n, e.get("value"));
						if (!t) return;
						let r = vp(t);
						e.set("indicatorRect", (e) => Zd(e, r) ? e : r);
					};
					i();
					let a = pp(n), o = lp(n), s = Cf(...a.map((e) => ad.observe(e, i)), ...o ? [ad.observe(o, i)] : []);
					t.set("indicatorCleanup", s);
				},
				navigateIfNeeded({ context: e, prop: t, scope: n }) {
					let r = e.get("value");
					if (!r) return;
					let i = dp(n, r);
					Kc(i) && t("navigate")?.({
						value: r,
						node: i,
						href: i.href
					});
				}
			}
		}
	});
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+types@1.42.0/node_modules/@zag-js/types/dist/prop-types.mjs
function mm(e) {
	return new Proxy({}, { get(t, n) {
		return n === "style" ? (t) => e({ style: t }).style : e;
	} });
}
var hm = t((() => {})), gm = t((() => {})), _m = t((() => {
	hm(), gm();
})), vm = t((() => {})), ym = t((() => {
	Cp(), pm(), vm();
})), bm, xm, Sm = t((() => {
	lc(), bm = ac("carousel").parts("root", "itemGroup", "item", "control", "nextTrigger", "prevTrigger", "indicatorGroup", "indicator", "autoplayTrigger", "progressText"), xm = bm.build();
})), Cm, wm, Tm, Em, Dm, Om, km, Am, jm, Mm, Nm, Pm = t((() => {
	Y(), Cm = (e) => e.ids?.root ?? `carousel:${e.id}`, wm = (e, t) => e.ids?.item?.(t) ?? `carousel:${e.id}:item:${t}`, Tm = (e) => e.ids?.itemGroup ?? `carousel:${e.id}:item-group`, Em = (e) => e.ids?.nextTrigger ?? `carousel:${e.id}:next-trigger`, Dm = (e) => e.ids?.prevTrigger ?? `carousel:${e.id}:prev-trigger`, Om = (e) => e.ids?.indicatorGroup ?? `carousel:${e.id}:indicator-group`, km = (e, t) => e.ids?.indicator?.(t) ?? `carousel:${e.id}:indicator:${t}`, Am = (e) => e.getById(Tm(e)), jm = (e) => Xu(Am(e), "[data-part=item]"), Mm = (e, t) => e.getById(km(e, t)), Nm = (e) => {
		let t = Am(e);
		if (!t) return;
		let n = su(t);
		t.setAttribute("tabindex", n.length > 0 ? "-1" : "0");
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+carousel@1.42.0/node_modules/@zag-js/carousel/dist/carousel.connect.mjs
function Fm(e, t) {
	let { state: n, context: r, computed: i, send: a, scope: o, prop: s } = e, c = n.matches("autoplay"), l = n.matches("dragging"), u = i("canScrollNext"), d = i("canScrollPrev"), f = i("isHorizontal"), p = s("autoSize"), m = Array.from(r.get("pageSnapPoints")), h = r.get("page"), g = m.length ? Bf(h, 0, m.length - 1) : 0, _ = s("slidesPerPage"), v = s("padding"), y = s("translations");
	return {
		isPlaying: c,
		isDragging: l,
		page: g,
		pageSnapPoints: m,
		canScrollNext: u,
		canScrollPrev: d,
		getProgress() {
			return g / m.length;
		},
		getProgressText() {
			let e = {
				page: g + 1,
				totalPages: m.length
			};
			return y.progressText?.(e) ?? "";
		},
		scrollToIndex(e, t) {
			a({
				type: "INDEX.SET",
				index: e,
				instant: t
			});
		},
		scrollTo(e, t) {
			a({
				type: "PAGE.SET",
				index: e,
				instant: t
			});
		},
		scrollNext(e) {
			a({
				type: "PAGE.NEXT",
				instant: e
			});
		},
		scrollPrev(e) {
			a({
				type: "PAGE.PREV",
				instant: e
			});
		},
		play() {
			a({ type: "AUTOPLAY.START" });
		},
		pause() {
			a({ type: "AUTOPLAY.PAUSE" });
		},
		isInView(e) {
			return Array.from(r.get("slidesInView")).includes(e);
		},
		refresh() {
			a({ type: "SNAP.REFRESH" });
		},
		getRootProps() {
			return t.element({
				...xm.root.attrs,
				id: Cm(o),
				role: "region",
				"aria-roledescription": "carousel",
				"data-orientation": s("orientation"),
				dir: s("dir"),
				style: {
					"--slides-per-page": _,
					"--slide-spacing": s("spacing"),
					"--slide-item-size": p ? "auto" : "calc(100% / var(--slides-per-page) - var(--slide-spacing) * (var(--slides-per-page) - 1) / var(--slides-per-page))"
				}
			});
		},
		getItemGroupProps() {
			return t.element({
				...xm.itemGroup.attrs,
				id: Tm(o),
				"data-orientation": s("orientation"),
				"data-dragging": K(l),
				dir: s("dir"),
				"aria-live": c ? "off" : "polite",
				onFocus(e) {
					kc(e.currentTarget, Sl(e)) && a({ type: "VIEWPORT.FOCUS" });
				},
				onBlur(e) {
					kc(e.currentTarget, e.relatedTarget) || a({ type: "VIEWPORT.BLUR" });
				},
				onMouseDown(e) {
					if (e.defaultPrevented || !s("allowMouseDrag") || !Nl(e)) return;
					let t = Sl(e);
					ou(t) && t !== e.currentTarget || (e.preventDefault(), a({ type: "DRAGGING.START" }));
				},
				onWheel: _f((e) => {
					let t = s("orientation") === "horizontal" ? "deltaX" : "deltaY";
					e[t] < 0 && !i("canScrollPrev") || e[t] > 0 && !i("canScrollNext") || a({ type: "USER.SCROLL" });
				}, 150),
				onTouchStart() {
					a({ type: "USER.SCROLL" });
				},
				style: {
					display: p ? "flex" : "grid",
					gap: "var(--slide-spacing)",
					scrollSnapType: [f ? "x" : "y", s("snapType")].join(" "),
					gridAutoFlow: f ? "column" : "row",
					scrollbarWidth: "none",
					overscrollBehaviorX: "contain",
					[f ? "gridAutoColumns" : "gridAutoRows"]: p ? void 0 : "var(--slide-item-size)",
					[f ? "scrollPaddingInline" : "scrollPaddingBlock"]: v,
					[f ? "paddingInline" : "paddingBlock"]: v,
					[f ? "overflowX" : "overflowY"]: "auto"
				}
			});
		},
		getItemProps(e) {
			let n = r.get("slidesInView").includes(e.index);
			return t.element({
				...xm.item.attrs,
				id: wm(o, e.index),
				dir: s("dir"),
				role: "group",
				"data-index": e.index,
				"data-inview": K(n),
				"aria-roledescription": "slide",
				"data-orientation": s("orientation"),
				"aria-label": y.item(e.index, s("slideCount")),
				"aria-hidden": wc(!n),
				style: {
					flex: "0 0 auto",
					[f ? "maxWidth" : "maxHeight"]: "100%",
					scrollSnapAlign: (() => {
						let t = e.snapAlign ?? "start", n = s("slidesPerMove"), r = n === "auto" ? Math.floor(s("slidesPerPage")) : n;
						return (e.index + r) % r === 0 ? t : void 0;
					})()
				}
			});
		},
		getControlProps() {
			return t.element({
				...xm.control.attrs,
				"data-orientation": s("orientation")
			});
		},
		getPrevTriggerProps() {
			return t.button({
				...xm.prevTrigger.attrs,
				id: Dm(o),
				type: "button",
				disabled: !d,
				dir: s("dir"),
				"aria-label": y.prevTrigger,
				"data-orientation": s("orientation"),
				"aria-controls": Tm(o),
				onClick(e) {
					e.defaultPrevented || a({
						type: "PAGE.PREV",
						src: "trigger"
					});
				}
			});
		},
		getNextTriggerProps() {
			return t.button({
				...xm.nextTrigger.attrs,
				dir: s("dir"),
				id: Em(o),
				type: "button",
				"aria-label": y.nextTrigger,
				"data-orientation": s("orientation"),
				"aria-controls": Tm(o),
				disabled: !u,
				onClick(e) {
					e.defaultPrevented || a({
						type: "PAGE.NEXT",
						src: "trigger"
					});
				}
			});
		},
		getIndicatorGroupProps() {
			return t.element({
				...xm.indicatorGroup.attrs,
				dir: s("dir"),
				id: Om(o),
				"data-orientation": s("orientation"),
				onKeyDown(e) {
					if (e.defaultPrevented) return;
					let t = "indicator", n = {
						ArrowDown(e) {
							f || (a({
								type: "PAGE.NEXT",
								src: t
							}), e.preventDefault());
						},
						ArrowUp(e) {
							f || (a({
								type: "PAGE.PREV",
								src: t
							}), e.preventDefault());
						},
						ArrowRight(e) {
							f && (a({
								type: "PAGE.NEXT",
								src: t
							}), e.preventDefault());
						},
						ArrowLeft(e) {
							f && (a({
								type: "PAGE.PREV",
								src: t
							}), e.preventDefault());
						},
						Home(e) {
							a({
								type: "PAGE.SET",
								index: 0,
								src: t
							}), e.preventDefault();
						},
						End(e) {
							a({
								type: "PAGE.SET",
								index: m.length - 1,
								src: t
							}), e.preventDefault();
						}
					}[kl(e, {
						dir: s("dir"),
						orientation: s("orientation")
					})];
					n?.(e);
				}
			});
		},
		getIndicatorProps(e) {
			return t.button({
				...xm.indicator.attrs,
				dir: s("dir"),
				id: km(o, e.index),
				type: "button",
				"data-orientation": s("orientation"),
				"data-index": e.index,
				"data-readonly": K(e.readOnly),
				"data-current": K(e.index === g),
				"aria-label": y.indicator(e.index),
				onClick(t) {
					t.defaultPrevented || e.readOnly || a({
						type: "PAGE.SET",
						index: e.index,
						src: "indicator"
					});
				}
			});
		},
		getAutoplayTriggerProps() {
			return t.button({
				...xm.autoplayTrigger.attrs,
				type: "button",
				"data-orientation": s("orientation"),
				"data-pressed": K(c),
				"aria-label": c ? y.autoplayStop : y.autoplayStart,
				onClick(e) {
					e.defaultPrevented || a({ type: c ? "AUTOPLAY.PAUSE" : "AUTOPLAY.START" });
				}
			});
		},
		getProgressTextProps() {
			return t.element({ ...xm.progressText.attrs });
		}
	};
}
var Im = t((() => {
	Y(), X(), Sm(), Pm();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+scroll-snap@1.42.0/node_modules/@zag-js/scroll-snap/dist/index.mjs
function Lm(e) {
	let t = Xc(e), n = e.offsetWidth, r = e.offsetHeight, i = t.getPropertyValue("scroll-padding-left").replace("auto", "0px"), a = t.getPropertyValue("scroll-padding-top").replace("auto", "0px"), o = t.getPropertyValue("scroll-padding-right").replace("auto", "0px"), s = t.getPropertyValue("scroll-padding-bottom").replace("auto", "0px"), c = Wm(i, n), l = Wm(a, r), u = Wm(o, n), d = Wm(s, r);
	return {
		x: {
			before: c,
			after: u
		},
		y: {
			before: l,
			after: d
		}
	};
}
function Rm(e, t, n = "both") {
	return n === "x" && e.right >= t.left && e.left <= t.right || n === "y" && e.bottom >= t.top && e.top <= t.bottom || n === "both" && e.right >= t.left && e.left <= t.right && e.bottom >= t.top && e.top <= t.bottom;
}
function zm(e) {
	let t = [];
	for (let n of e.children) t = t.concat(n, zm(n));
	return t;
}
function Bm(e, t = !1) {
	let n = e.getBoundingClientRect(), r = Um(e) === "rtl", i = sd(e), a = {
		x: {
			start: [],
			center: [],
			end: []
		},
		y: {
			start: [],
			center: [],
			end: []
		}
	}, o = t ? zm(e) : e.children;
	for (let t of ["x", "y"]) {
		let s = t === "x" ? "y" : "x", c = t === "x" ? "left" : "top", l = t === "x" ? "right" : "bottom", u = t === "x" ? "width" : "height", d = t === "x" ? "scrollLeft" : "scrollTop", f = t === "x" ? i.x : i.y, p = r && t === "x";
		for (let r of o) {
			let i = r.getBoundingClientRect();
			if (!Rm(n, i, s)) continue;
			let [o, m] = Xc(r).getPropertyValue("scroll-snap-align").split(" ");
			m === void 0 && (m = o);
			let h = t === "x" ? m : o, g, _, v;
			if (p) {
				let t = Math.abs(e[d]), r = (n[l] - i[l]) / f + t;
				g = r, _ = r + i[u] / f, v = r + i[u] / (2 * f);
			} else g = (i[c] - n[c]) / f + e[d], _ = g + i[u] / f, v = g + i[u] / (2 * f);
			switch (h) {
				case "none": break;
				case "start":
					a[t].start.push({
						node: r,
						position: g
					});
					break;
				case "center":
					a[t].center.push({
						node: r,
						position: v
					});
					break;
				case "end":
					a[t].end.push({
						node: r,
						position: _
					});
					break;
			}
		}
	}
	return a;
}
function Vm(e) {
	let t = Um(e), n = Lm(e), r = Bm(e), i = e.offsetWidth, a = e.offsetHeight, o = {
		x: e.scrollWidth - e.offsetWidth,
		y: e.scrollHeight - e.offsetHeight
	}, s = t === "rtl", c = s && e.scrollLeft <= 0, l;
	return s ? (l = Gm([
		...r.x.start.map((e) => e.position - n.x.after),
		...r.x.center.map((e) => e.position - i / 2),
		...r.x.end.map((e) => e.position - i + n.x.before)
	].map(Km(0, o.x))), c && (l = l.map((e) => -e))) : l = Gm([
		...r.x.start.map((e) => e.position - n.x.before),
		...r.x.center.map((e) => e.position - i / 2),
		...r.x.end.map((e) => e.position - i + n.x.after)
	].map(Km(0, o.x))), {
		x: l,
		y: Gm([
			...r.y.start.map((e) => e.position - n.y.before),
			...r.y.center.map((e) => e.position - a / 2),
			...r.y.end.map((e) => e.position - a + n.y.after)
		].map(Km(0, o.y)))
	};
}
function Hm(e, t, n) {
	let r = Um(e), i = Lm(e), a = Bm(e), o = [
		...a[t].start,
		...a[t].center,
		...a[t].end
	], s = r === "rtl", c = s && t === "x" && e.scrollLeft <= 0;
	for (let e of o) if (n(e.node)) {
		let n;
		return t === "x" && s ? (n = e.position - i.x.after, c && (n = -n)) : n = e.position - (t === "x" ? i.x.before : i.y.before), n;
	}
}
var Um, Wm, Gm, Km, qm = t((() => {
	Y(), Um = (e) => Xc(e).direction, Wm = (e, t) => {
		let n = parseFloat(e);
		return /%/.test(e) && (n /= 100, n *= t), Number.isNaN(n) ? 0 : n;
	}, Gm = (e) => [...new Set(e)], Km = (e, t) => (n) => Math.max(e, Math.min(t, n));
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+carousel@1.42.0/node_modules/@zag-js/carousel/dist/carousel.machine.mjs
function Jm(e, t, n) {
	if (e == null || n <= 0) return [];
	let r = [], i = t === "auto" ? Math.floor(n) : t;
	if (i <= 0) return [];
	for (let t = 0; t < e && !(t + n > e); t += i) r.push(t);
	return r;
}
var Ym, Xm, Zm = t((() => {
	um(), Y(), qm(), X(), Pm(), Ym = 1, Xm = nm({
		props({ props: e }) {
			return np(e, ["slideCount"], "carousel"), {
				dir: "ltr",
				defaultPage: 0,
				orientation: "horizontal",
				snapType: "mandatory",
				loop: !!e.autoplay,
				slidesPerPage: 1,
				slidesPerMove: "auto",
				spacing: "0px",
				autoplay: !1,
				allowMouseDrag: !1,
				inViewThreshold: .6,
				autoSize: !1,
				...e,
				translations: {
					nextTrigger: "Next slide",
					prevTrigger: "Previous slide",
					indicator: (e) => `Go to slide ${e + 1}`,
					item: (e, t) => `${e + 1} of ${t}`,
					autoplayStart: "Start slide rotation",
					autoplayStop: "Stop slide rotation",
					progressText: ({ page: e, totalPages: t }) => `${e} / ${t}`,
					...e.translations
				}
			};
		},
		refs() {
			return { timeoutRef: void 0 };
		},
		initialState({ prop: e }) {
			return e("autoplay") ? "autoplay" : "idle";
		},
		context({ prop: e, bindable: t, getContext: n }) {
			return {
				page: t(() => ({
					defaultValue: e("defaultPage"),
					value: e("page"),
					onChange(t) {
						let r = n().get("pageSnapPoints");
						e("onPageChange")?.({
							page: t,
							pageSnapPoint: r[t]
						});
					}
				})),
				pageSnapPoints: t(() => ({ defaultValue: e("autoSize") ? Array.from({ length: e("slideCount") }, (e, t) => t) : Jm(e("slideCount"), e("slidesPerMove"), e("slidesPerPage")) })),
				slidesInView: t(() => ({ defaultValue: [] }))
			};
		},
		computed: {
			isRtl: ({ prop: e }) => e("dir") === "rtl",
			isHorizontal: ({ prop: e }) => e("orientation") === "horizontal",
			canScrollNext: ({ prop: e, context: t }) => e("loop") || t.get("page") < t.get("pageSnapPoints").length - 1,
			canScrollPrev: ({ prop: e, context: t }) => e("loop") || t.get("page") > 0,
			autoplayInterval: ({ prop: e }) => {
				let t = e("autoplay");
				return nf(t) ? t.delay : 4e3;
			}
		},
		watch({ track: e, action: t, context: n, prop: r, send: i }) {
			e([() => r("slidesPerPage"), () => r("slidesPerMove")], () => {
				t(["setSnapPoints"]);
			}), e([() => n.get("page")], () => {
				t(["scrollToPage", "focusIndicatorEl"]);
			}), e([
				() => r("orientation"),
				() => r("autoSize"),
				() => r("dir")
			], () => {
				t(["setSnapPoints", "scrollToPage"]);
			}), e([() => r("slideCount")], () => {
				i({
					type: "SNAP.REFRESH",
					src: "slide.count"
				});
			}), e([() => !!r("autoplay")], () => {
				i({
					type: r("autoplay") ? "AUTOPLAY.START" : "AUTOPLAY.PAUSE",
					src: "autoplay.prop.change"
				});
			});
		},
		on: {
			"PAGE.NEXT": {
				target: "idle",
				actions: ["clearScrollEndTimer", "setNextPage"]
			},
			"PAGE.PREV": {
				target: "idle",
				actions: ["clearScrollEndTimer", "setPrevPage"]
			},
			"PAGE.SET": {
				target: "idle",
				actions: ["clearScrollEndTimer", "setPage"]
			},
			"INDEX.SET": {
				target: "idle",
				actions: ["clearScrollEndTimer", "setMatchingPage"]
			},
			"SNAP.REFRESH": { actions: ["setSnapPoints", "scrollToPageIfDrifted"] },
			"PAGE.SCROLL": { actions: ["scrollToPage"] }
		},
		effects: [
			"trackSlideMutation",
			"trackSlideIntersections",
			"trackSlideResize"
		],
		entry: ["setSnapPoints", "setPage"],
		exit: ["clearScrollEndTimer"],
		states: {
			idle: { on: {
				"DRAGGING.START": {
					target: "dragging",
					actions: ["invokeDragStart"]
				},
				"AUTOPLAY.START": {
					target: "autoplay",
					actions: ["invokeAutoplayStart"]
				},
				"USER.SCROLL": { target: "userScroll" },
				"VIEWPORT.FOCUS": { target: "focus" }
			} },
			focus: {
				effects: ["trackKeyboardScroll"],
				on: {
					"VIEWPORT.BLUR": { target: "idle" },
					"PAGE.NEXT": { actions: ["clearScrollEndTimer", "setNextPage"] },
					"PAGE.PREV": { actions: ["clearScrollEndTimer", "setPrevPage"] },
					"PAGE.SET": { actions: ["clearScrollEndTimer", "setPage"] },
					"INDEX.SET": { actions: ["clearScrollEndTimer", "setMatchingPage"] },
					"USER.SCROLL": { target: "userScroll" }
				}
			},
			dragging: {
				effects: ["trackPointerMove"],
				entry: ["disableScrollSnap"],
				on: {
					DRAGGING: { actions: ["scrollSlides", "invokeDragging"] },
					"DRAGGING.END": {
						target: "settling",
						actions: ["endDragging"]
					}
				}
			},
			settling: {
				effects: ["trackSettlingScroll"],
				on: {
					"DRAGGING.START": {
						target: "dragging",
						actions: ["clearScrollEndTimer", "invokeDragStart"]
					},
					"SCROLL.END": [{
						guard: "isFocused",
						target: "focus",
						actions: [
							"clearScrollEndTimer",
							"setClosestPage",
							"invokeDraggingEnd"
						]
					}, {
						target: "idle",
						actions: [
							"clearScrollEndTimer",
							"setClosestPage",
							"invokeDraggingEnd"
						]
					}]
				}
			},
			userScroll: {
				effects: ["trackScroll"],
				on: {
					"DRAGGING.START": {
						target: "dragging",
						actions: ["invokeDragStart"]
					},
					"SCROLL.END": [{
						guard: "isFocused",
						target: "focus",
						actions: ["setClosestPage"]
					}, {
						target: "idle",
						actions: ["setClosestPage"]
					}]
				}
			},
			autoplay: {
				effects: [
					"trackDocumentVisibility",
					"trackScroll",
					"autoUpdateSlide"
				],
				exit: ["invokeAutoplayEnd"],
				on: {
					"AUTOPLAY.TICK": { actions: ["setNextPage", "invokeAutoplay"] },
					"DRAGGING.START": {
						target: "dragging",
						actions: ["invokeDragStart"]
					},
					"AUTOPLAY.PAUSE": { target: "idle" }
				}
			}
		},
		implementations: {
			guards: { isFocused: ({ scope: e }) => e.isActiveElement(Am(e)) },
			effects: {
				autoUpdateSlide({ computed: e, send: t }) {
					let n = setInterval(() => {
						t({
							type: e("canScrollNext") ? "AUTOPLAY.TICK" : "AUTOPLAY.PAUSE",
							src: "autoplay.interval"
						});
					}, e("autoplayInterval"));
					return () => clearInterval(n);
				},
				trackSlideMutation({ scope: e, send: t }) {
					let n = Am(e);
					if (!n) return;
					let r = new (e.getWin()).MutationObserver(() => {
						t({
							type: "SNAP.REFRESH",
							src: "slide.mutation"
						}), Nm(e);
					});
					return Nm(e), r.observe(n, {
						childList: !0,
						subtree: !0
					}), () => r.disconnect();
				},
				trackSlideResize({ scope: e, send: t }) {
					let n = Am(e);
					if (!n) return;
					let r = () => {
						t({
							type: "SNAP.REFRESH",
							src: "slide.resize"
						});
					};
					J(() => {
						r(), J(() => {
							t({
								type: "PAGE.SCROLL",
								instant: !0
							});
						});
					});
					let i = jm(e);
					return i.forEach(r), Cf(ad.observe(n, r), ...i.map((e) => ad.observe(e, r)));
				},
				trackSlideIntersections({ scope: e, prop: t, context: n }) {
					let r = Am(e), i = new (e.getWin()).IntersectionObserver((e) => {
						let t = e.reduce((e, t) => {
							let n = t.target, r = Number(n.dataset.index ?? "-1");
							return r == null || Number.isNaN(r) || r === -1 ? e : t.isIntersecting ? Ud(e, r) : Wd(e, r);
						}, n.get("slidesInView"));
						n.set("slidesInView", Gd(t));
					}, {
						root: r,
						threshold: t("inViewThreshold")
					});
					return jm(e).forEach((e) => i.observe(e)), () => i.disconnect();
				},
				trackScroll({ send: e, refs: t, scope: n }) {
					let r = Am(n);
					return r ? q(r, "scroll", () => {
						clearTimeout(t.get("timeoutRef")), t.set("timeoutRef", void 0), t.set("timeoutRef", setTimeout(() => {
							e({ type: "SCROLL.END" });
						}, 150));
					}, { passive: !0 }) : void 0;
				},
				trackSettlingScroll({ send: e, refs: t, scope: n }) {
					let r = Am(n);
					if (!r) return;
					let i = () => {
						clearTimeout(t.get("timeoutRef")), t.set("timeoutRef", void 0), t.set("timeoutRef", setTimeout(() => {
							e({ type: "SCROLL.END" });
						}, 200));
					};
					i();
					let a = q(r, "scroll", () => {
						i();
					}, { passive: !0 });
					return () => {
						a(), clearTimeout(t.get("timeoutRef")), t.set("timeoutRef", void 0);
					};
				},
				trackDocumentVisibility({ scope: e, send: t }) {
					let n = e.getDoc();
					return q(n, "visibilitychange", () => {
						n.visibilityState !== "visible" && t({
							type: "AUTOPLAY.PAUSE",
							src: "doc.hidden"
						});
					});
				},
				trackPointerMove({ scope: e, send: t }) {
					return Gu(e.getDoc(), {
						onPointerMove({ event: e }) {
							t({
								type: "DRAGGING",
								left: -e.movementX,
								top: -e.movementY
							});
						},
						onPointerUp() {
							t({ type: "DRAGGING.END" });
						}
					});
				},
				trackKeyboardScroll({ scope: e, send: t, context: n }) {
					let r = e.getWin();
					return q(r, "keydown", (e) => {
						switch (e.key) {
							case "ArrowRight":
								e.preventDefault(), t({ type: "PAGE.NEXT" });
								break;
							case "ArrowLeft":
								e.preventDefault(), t({ type: "PAGE.PREV" });
								break;
							case "Home":
								e.preventDefault(), t({
									type: "PAGE.SET",
									index: 0
								});
								break;
							case "End": e.preventDefault(), t({
								type: "PAGE.SET",
								index: n.get("pageSnapPoints").length - 1
							});
						}
					}, { capture: !0 });
				}
			},
			actions: {
				clearScrollEndTimer({ refs: e }) {
					e.get("timeoutRef") != null && (clearTimeout(e.get("timeoutRef")), e.set("timeoutRef", void 0));
				},
				scrollToPage({ context: e, event: t, scope: n, computed: r, flush: i }) {
					let a = t.instant ? "instant" : "smooth", o = Bf(t.index ?? e.get("page"), 0, e.get("pageSnapPoints").length - 1), s = Am(n);
					if (!s) return;
					let c = r("isHorizontal") ? "left" : "top";
					i(() => {
						s.scrollTo({
							[c]: e.get("pageSnapPoints")[o],
							behavior: a
						});
					});
				},
				scrollToPageIfDrifted({ context: e, scope: t, computed: n }) {
					let r = Am(t);
					if (!r) return;
					let i = e.get("pageSnapPoints")[e.get("page")];
					if (i == null) return;
					let a = n("isHorizontal") ? r.scrollLeft : r.scrollTop;
					if (Math.abs(a - i) <= Ym) return;
					let o = n("isHorizontal") ? "left" : "top";
					r.scrollTo({
						[o]: i,
						behavior: "instant"
					});
				},
				setClosestPage({ context: e, scope: t, computed: n }) {
					let r = Am(t);
					if (!r) return;
					let i = n("isHorizontal") ? r.scrollLeft : r.scrollTop, a = e.get("pageSnapPoints");
					if (!a.length) return;
					let o = a.reduce((e, t, n) => Math.abs(t - i) < Math.abs(a[e] - i) ? n : e, 0);
					e.set("page", o);
				},
				setNextPage({ context: e, prop: t, state: n }) {
					let r = n.matches("autoplay") || t("loop"), i = Nd(e.get("pageSnapPoints"), e.get("page"), { loop: r });
					e.set("page", i);
				},
				setPrevPage({ context: e, prop: t, state: n }) {
					let r = n.matches("autoplay") || t("loop"), i = Fd(e.get("pageSnapPoints"), e.get("page"), { loop: r });
					e.set("page", i);
				},
				setMatchingPage({ context: e, event: t, computed: n, scope: r }) {
					let i = Am(r);
					if (!i) return;
					let a = Hm(i, n("isHorizontal") ? "x" : "y", (e) => e.dataset.index === t.index.toString());
					if (a == null) return;
					let o = e.get("pageSnapPoints").findIndex((e) => Math.abs(e - a) < 1);
					e.set("page", o);
				},
				setPage({ context: e, event: t }) {
					let n = t.index ?? e.get("page");
					e.set("page", n);
				},
				setSnapPoints({ context: e, computed: t, scope: n }) {
					let r = Am(n);
					if (!r) return;
					let i = Vm(r), a = t("isHorizontal") ? i.x : i.y;
					if (e.set("pageSnapPoints", a), !a.length) return;
					let o = Bf(e.get("page"), 0, a.length - 1);
					e.set("page", o);
				},
				disableScrollSnap({ scope: e }) {
					let t = Am(e);
					if (!t) return;
					let n = getComputedStyle(t);
					t.dataset.scrollSnapType = n.getPropertyValue("scroll-snap-type"), t.style.setProperty("scroll-snap-type", "none");
				},
				scrollSlides({ scope: e, event: t }) {
					Am(e)?.scrollBy({
						left: t.left,
						top: t.top,
						behavior: "instant"
					});
				},
				endDragging({ scope: e, context: t, computed: n }) {
					let r = Am(e);
					if (!r) return;
					let i = n("isHorizontal"), a = i ? r.scrollLeft : r.scrollTop, o = t.get("pageSnapPoints");
					if (!o.length) return;
					let s = o.reduce((e, t) => Math.abs(t - a) < Math.abs(e - a) ? t : e, o[0]);
					J(() => {
						r.scrollTo({
							left: i ? s : r.scrollLeft,
							top: i ? r.scrollTop : s,
							behavior: "smooth"
						});
						let e = r.dataset.scrollSnapType;
						e && (r.style.setProperty("scroll-snap-type", e), delete r.dataset.scrollSnapType);
					});
				},
				focusIndicatorEl({ context: e, event: t, scope: n }) {
					if (t.src !== "indicator") return;
					let r = Mm(n, e.get("page"));
					r && J(() => r.focus({ preventScroll: !0 }));
				},
				invokeDragStart({ context: e, prop: t }) {
					t("onDragStatusChange")?.({
						type: "dragging.start",
						isDragging: !0,
						page: e.get("page")
					});
				},
				invokeDragging({ context: e, prop: t }) {
					t("onDragStatusChange")?.({
						type: "dragging",
						isDragging: !0,
						page: e.get("page")
					});
				},
				invokeDraggingEnd({ context: e, prop: t }) {
					t("onDragStatusChange")?.({
						type: "dragging.end",
						isDragging: !1,
						page: e.get("page")
					});
				},
				invokeAutoplay({ context: e, prop: t }) {
					t("onAutoplayStatusChange")?.({
						type: "autoplay",
						isPlaying: !0,
						page: e.get("page")
					});
				},
				invokeAutoplayStart({ context: e, prop: t }) {
					t("onAutoplayStatusChange")?.({
						type: "autoplay.start",
						isPlaying: !0,
						page: e.get("page")
					});
				},
				invokeAutoplayEnd({ context: e, prop: t }) {
					t("onAutoplayStatusChange")?.({
						type: "autoplay.stop",
						isPlaying: !1,
						page: e.get("page")
					});
				}
			}
		}
	});
})), Qm = t((() => {})), $m = t((() => {
	Im(), Zm(), Qm();
})), eh, th, nh = t((() => {
	lc(), eh = ac("collapsible").parts("root", "trigger", "content", "indicator"), th = eh.build();
})), rh, ih, ah, oh, sh = t((() => {
	rh = (e) => e.ids?.root ?? `collapsible:${e.id}`, ih = (e) => e.ids?.content ?? `collapsible:${e.id}:content`, ah = (e) => e.ids?.trigger ?? `collapsible:${e.id}:trigger`, oh = (e) => e.getById(ih(e));
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+collapsible@1.42.0/node_modules/@zag-js/collapsible/dist/collapsible.connect.mjs
function ch(e, t) {
	let { state: n, send: r, context: i, scope: a, prop: o } = e, s = n.matches("open") || n.matches("closing"), c = n.matches("open"), l = n.matches("closed"), { width: u, height: d } = i.get("size"), f = !!o("disabled"), p = o("collapsedHeight"), m = o("collapsedWidth"), h = p != null, g = m != null, _ = h || g, v = !i.get("initial") && c;
	return {
		disabled: f,
		visible: s,
		open: c,
		measureSize() {
			r({ type: "size.measure" });
		},
		setOpen(e) {
			n.matches("open") !== e && r({ type: e ? "open" : "close" });
		},
		getRootProps() {
			return t.element({
				...th.root.attrs,
				"data-state": c ? "open" : "closed",
				dir: o("dir"),
				id: rh(a)
			});
		},
		getContentProps() {
			return t.element({
				...th.content.attrs,
				id: ih(a),
				"data-collapsible": "",
				"data-state": v ? void 0 : c ? "open" : "closed",
				"data-disabled": K(f),
				"data-has-collapsed-size": K(_),
				hidden: !s && !_,
				dir: o("dir"),
				style: {
					"--height": Kf(d),
					"--width": Kf(u),
					"--collapsed-height": Kf(p),
					"--collapsed-width": Kf(m),
					...l && h && {
						overflow: "hidden",
						minHeight: Kf(p),
						maxHeight: Kf(p)
					},
					...l && g && {
						overflow: "hidden",
						minWidth: Kf(m),
						maxWidth: Kf(m)
					}
				}
			});
		},
		getTriggerProps() {
			return t.element({
				...th.trigger.attrs,
				id: ah(a),
				dir: o("dir"),
				type: "button",
				"data-state": c ? "open" : "closed",
				"data-disabled": K(f),
				"aria-controls": ih(a),
				"aria-expanded": s || !1,
				onClick(e) {
					e.defaultPrevented || f || r({ type: c ? "close" : "open" });
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...th.indicator.attrs,
				dir: o("dir"),
				"data-state": c ? "open" : "closed",
				"data-disabled": K(f)
			});
		}
	};
}
var lh = t((() => {
	Y(), nh(), sh(), X();
})), uh, dh = t((() => {
	um(), Y(), sh(), uh = nm({
		initialState({ prop: e }) {
			return e("open") || e("defaultOpen") ? "open" : "closed";
		},
		context({ bindable: e }) {
			return {
				size: e(() => ({
					defaultValue: {
						height: 0,
						width: 0
					},
					sync: !0
				})),
				initial: e(() => ({ defaultValue: !1 }))
			};
		},
		refs() {
			return {
				cleanup: void 0,
				stylesRef: void 0
			};
		},
		watch({ track: e, prop: t, action: n }) {
			e([() => t("open")], () => {
				n([
					"setInitial",
					"computeSize",
					"toggleVisibility"
				]);
			});
		},
		exit: ["cleanupNode"],
		states: {
			closed: {
				effects: ["trackTabbableElements"],
				on: {
					"controlled.open": { target: "open" },
					open: [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"setInitial",
							"computeSize",
							"invokeOnOpen"
						]
					}]
				}
			},
			closing: {
				effects: ["trackExitAnimation"],
				on: {
					"controlled.close": { target: "closed" },
					"controlled.open": { target: "open" },
					open: [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: ["setInitial", "invokeOnOpen"]
					}],
					close: [{
						guard: "isOpenControlled",
						actions: ["invokeOnExitComplete"]
					}, {
						target: "closed",
						actions: [
							"setInitial",
							"computeSize",
							"invokeOnExitComplete"
						]
					}],
					"animation.end": {
						target: "closed",
						actions: ["invokeOnExitComplete", "clearInitial"]
					}
				}
			},
			open: {
				effects: ["trackEnterAnimation"],
				on: {
					"controlled.close": { target: "closing" },
					close: [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose"]
					}, {
						target: "closing",
						actions: [
							"setInitial",
							"computeSize",
							"invokeOnClose"
						]
					}],
					"size.measure": { actions: ["measureSize"] },
					"animation.end": { actions: ["clearInitial"] }
				}
			}
		},
		implementations: {
			guards: { isOpenControlled: ({ prop: e }) => e("open") != null },
			effects: {
				trackEnterAnimation: ({ send: e, scope: t }) => {
					let n, r = J(() => {
						let r = oh(t);
						if (!r) return;
						let i = Xc(r).animationName;
						if (!i || i === "none") {
							e({ type: "animation.end" });
							return;
						}
						let a = (t) => {
							Sl(t) === r && e({ type: "animation.end" });
						};
						r.addEventListener("animationend", a), n = () => {
							r.removeEventListener("animationend", a);
						};
					});
					return () => {
						r(), n?.();
					};
				},
				trackExitAnimation: ({ send: e, scope: t }) => {
					let n, r = J(() => {
						let r = oh(t);
						if (!r) return;
						let i = Xc(r).animationName;
						if (!i || i === "none") {
							e({ type: "animation.end" });
							return;
						}
						let a = (t) => {
							Sl(t) === r && e({ type: "animation.end" });
						};
						r.addEventListener("animationend", a);
						let o = yd(r, { animationFillMode: "forwards" });
						n = () => {
							r.removeEventListener("animationend", a), vu(() => o());
						};
					});
					return () => {
						r(), n?.();
					};
				},
				trackTabbableElements: ({ scope: e, prop: t }) => {
					if (!t("collapsedHeight") && !t("collapsedWidth")) return;
					let n = oh(e);
					if (!n) return;
					let r = () => {
						let e = su(n).map((e) => vd(e, "inert", ""));
						return () => {
							e.forEach((e) => e());
						};
					}, i = r(), a = Tu(n, { callback() {
						i(), i = r();
					} });
					return () => {
						i(), a();
					};
				}
			},
			actions: {
				setInitial: ({ context: e, flush: t }) => {
					t(() => {
						e.set("initial", !0);
					});
				},
				clearInitial: ({ context: e }) => {
					e.set("initial", !1);
				},
				cleanupNode: ({ refs: e }) => {
					e.set("stylesRef", null);
				},
				measureSize: ({ context: e, scope: t }) => {
					let n = oh(t);
					if (!n) return;
					let { height: r, width: i } = n.getBoundingClientRect();
					e.set("size", {
						height: r,
						width: i
					});
				},
				computeSize: ({ refs: e, scope: t, context: n }) => {
					e.get("cleanup")?.();
					let r = J(() => {
						let e = oh(t);
						if (!e) return;
						let r = e.hidden;
						e.style.animationName = "none", e.style.animationDuration = "0s", e.hidden = !1;
						let i = e.getBoundingClientRect();
						n.set("size", {
							height: i.height,
							width: i.width
						}), n.get("initial") && (e.style.animationName = "", e.style.animationDuration = ""), e.hidden = r;
					});
					e.set("cleanup", r);
				},
				invokeOnOpen: ({ prop: e }) => {
					e("onOpenChange")?.({ open: !0 });
				},
				invokeOnClose: ({ prop: e }) => {
					e("onOpenChange")?.({ open: !1 });
				},
				invokeOnExitComplete: ({ prop: e }) => {
					e("onExitComplete")?.();
				},
				toggleVisibility: ({ prop: e, send: t }) => {
					t({ type: e("open") ? "controlled.open" : "controlled.close" });
				}
			}
		}
	});
})), fh = t((() => {})), ph = t((() => {
	lh(), dh(), fh();
})), mh, hh, gh = t((() => {
	lc(), mh = ac("checkbox").parts("root", "label", "control", "indicator"), hh = mh.build();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+focus-visible@1.42.0/node_modules/@zag-js/focus-visible/dist/index.mjs
function _h(e) {
	return !(e.metaKey || !gl() && e.altKey || e.ctrlKey || e.key === "Control" || e.key === "Shift" || e.key === "Meta");
}
function vh(e, t, n) {
	let r = n ? Sl(n) : null, i = Ac(r), a = Mc(r), o = Nc(i);
	return e = e || o instanceof a.HTMLInputElement && !Ah.has(o?.type) || o instanceof a.HTMLTextAreaElement || o instanceof a.HTMLElement && o.isContentEditable, !(e && t === "keyboard" && n instanceof a.KeyboardEvent && !Reflect.has(Ih, n.key));
}
function yh(e, t) {
	for (let n of Mh) n(e, t);
}
function bh(e) {
	Ph = !0, _h(e) && (jh = "keyboard", yh("keyboard", e));
}
function xh(e) {
	jh = "pointer", (e.type === "mousedown" || e.type === "pointerdown") && (Ph = !0, yh("pointer", e));
}
function Sh(e) {
	Ol(e) && (Ph = !0, jh = "virtual");
}
function Ch(e) {
	let t = Sl(e);
	t === Mc(t) || t === Ac(t) || !e.isTrusted || (!Ph && !Fh && (jh = "virtual", yh("virtual", e)), Ph = !1, Fh = !1);
}
function wh() {
	Ph = !1, Fh = !0;
}
function Th(e) {
	if (typeof window > "u" || Nh.get(Mc(e))) return;
	let t = Mc(e), n = Ac(e), r = t.HTMLElement.prototype.focus;
	function i() {
		Ph = !0, r.apply(this, arguments);
	}
	try {
		Object.defineProperty(t.HTMLElement.prototype, "focus", {
			configurable: !0,
			value: i
		});
	} catch {}
	n.addEventListener("keydown", bh, !0), n.addEventListener("keyup", bh, !0), n.addEventListener("click", Sh, !0), t.addEventListener("focus", Ch, !0), t.addEventListener("blur", wh, !1), t.PointerEvent === void 0 ? (n.addEventListener("mousedown", xh, !0), n.addEventListener("mousemove", xh, !0), n.addEventListener("mouseup", xh, !0)) : (n.addEventListener("pointerdown", xh, !0), n.addEventListener("pointermove", xh, !0), n.addEventListener("pointerup", xh, !0)), t.addEventListener("beforeunload", () => {
		Lh(e);
	}, { once: !0 }), Nh.set(t, { focus: r });
}
function Eh() {
	return jh;
}
function Dh(e) {
	jh = e, yh(e, null);
}
function Oh() {
	return jh === "keyboard" || jh === "virtual";
}
function kh(e = {}) {
	let { isTextInput: t, autoFocus: n, onChange: r, root: i } = e;
	Th(i), r?.({
		isFocusVisible: n || Oh(),
		modality: jh
	});
	let a = (e, n) => {
		vh(!!t, e, n) && r?.({
			isFocusVisible: Oh(),
			modality: e
		});
	};
	return Mh.add(a), () => {
		Mh.delete(a);
	};
}
var Ah, jh, Mh, Nh, Ph, Fh, Ih, Lh, Rh = t((() => {
	Y(), Ah = /* @__PURE__ */ new Set([
		"checkbox",
		"radio",
		"range",
		"color",
		"file",
		"image",
		"button",
		"submit",
		"reset"
	]), jh = null, Mh = /* @__PURE__ */ new Set(), Nh = /* @__PURE__ */ new Map(), Ph = !1, Fh = !1, Ih = {
		Tab: !0,
		Escape: !0
	}, Lh = (e, t) => {
		let n = Mc(e), r = Ac(e);
		t && r.removeEventListener("DOMContentLoaded", t);
		let i = Nh.get(n);
		if (i) {
			try {
				Object.defineProperty(n.HTMLElement.prototype, "focus", {
					configurable: !0,
					value: i.focus
				});
			} catch {}
			r.removeEventListener("keydown", bh, !0), r.removeEventListener("keyup", bh, !0), r.removeEventListener("click", Sh, !0), n.removeEventListener("focus", Ch, !0), n.removeEventListener("blur", wh, !1), n.PointerEvent === void 0 ? (r.removeEventListener("mousedown", xh, !0), r.removeEventListener("mousemove", xh, !0), r.removeEventListener("mouseup", xh, !0)) : (r.removeEventListener("pointerdown", xh, !0), r.removeEventListener("pointermove", xh, !0), r.removeEventListener("pointerup", xh, !0)), Nh.delete(n);
		}
	};
})), zh, Bh, Vh, Hh, Uh, Wh, Gh = t((() => {
	zh = (e) => e.ids?.root ?? `checkbox:${e.id}`, Bh = (e) => e.ids?.label ?? `checkbox:${e.id}:label`, Vh = (e) => e.ids?.control ?? `checkbox:${e.id}:control`, Hh = (e) => e.ids?.hiddenInput ?? `checkbox:${e.id}:input`, Uh = (e) => e.getById(zh(e)), Wh = (e) => e.getById(Hh(e));
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+checkbox@1.42.0/node_modules/@zag-js/checkbox/dist/checkbox.connect.mjs
function Kh(e, t) {
	let { send: n, context: r, prop: i, computed: a, scope: o } = e, s = !!i("disabled"), c = !!i("readOnly"), l = !!i("required"), u = !!i("invalid"), d = !s && r.get("focused"), f = !s && r.get("focusVisible"), p = a("checked"), m = a("indeterminate"), h = r.get("checked"), g = {
		"data-active": K(r.get("active")),
		"data-focus": K(d),
		"data-focus-visible": K(f),
		"data-readonly": K(c),
		"data-hover": K(r.get("hovered")),
		"data-disabled": K(s),
		"data-state": m ? "indeterminate" : p ? "checked" : "unchecked",
		"data-invalid": K(u),
		"data-required": K(l)
	};
	return {
		checked: p,
		disabled: s,
		indeterminate: m,
		focused: d,
		checkedState: h,
		setChecked(e) {
			n({
				type: "CHECKED.SET",
				checked: e,
				isTrusted: !1
			});
		},
		toggleChecked() {
			n({
				type: "CHECKED.TOGGLE",
				checked: p,
				isTrusted: !1
			});
		},
		getRootProps() {
			return t.label({
				...hh.root.attrs,
				...g,
				dir: i("dir"),
				id: zh(o),
				htmlFor: Hh(o),
				onPointerMove() {
					s || n({
						type: "CONTEXT.SET",
						context: { hovered: !0 }
					});
				},
				onPointerLeave() {
					s || n({
						type: "CONTEXT.SET",
						context: { hovered: !1 }
					});
				},
				onClick(e) {
					Sl(e) === Wh(o) && e.stopPropagation();
				}
			});
		},
		getLabelProps() {
			return t.element({
				...hh.label.attrs,
				...g,
				dir: i("dir"),
				id: Bh(o)
			});
		},
		getControlProps() {
			return t.element({
				...hh.control.attrs,
				...g,
				dir: i("dir"),
				id: Vh(o),
				"aria-hidden": !0
			});
		},
		getIndicatorProps() {
			return t.element({
				...hh.indicator.attrs,
				...g,
				dir: i("dir"),
				hidden: !m && !p
			});
		},
		getHiddenInputProps() {
			return t.input({
				id: Hh(o),
				type: "checkbox",
				required: i("required"),
				defaultChecked: p,
				disabled: s,
				"aria-labelledby": Bh(o),
				"aria-invalid": u,
				name: i("name"),
				form: i("form"),
				value: i("value"),
				style: Dd,
				onFocus() {
					let e = Oh();
					n({
						type: "CONTEXT.SET",
						context: {
							focused: !0,
							focusVisible: e
						}
					});
				},
				onBlur() {
					n({
						type: "CONTEXT.SET",
						context: {
							focused: !1,
							focusVisible: !1
						}
					});
				},
				onClick(e) {
					if (c) {
						e.preventDefault();
						return;
					}
					let t = e.currentTarget.checked;
					n({
						type: "CHECKED.SET",
						checked: t,
						isTrusted: !0
					});
				}
			});
		}
	};
}
var qh = t((() => {
	Y(), Rh(), gh(), Gh();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+checkbox@1.42.0/node_modules/@zag-js/checkbox/dist/checkbox.machine.mjs
function Jh(e) {
	return e === "indeterminate";
}
function Yh(e) {
	return !Jh(e) && !!e;
}
var Xh, Zh, Qh = t((() => {
	um(), Y(), Rh(), Gh(), {not: Xh} = tm(), Zh = nm({
		props({ props: e }) {
			return {
				value: "on",
				...e,
				defaultChecked: e.defaultChecked ?? !1
			};
		},
		initialState() {
			return "ready";
		},
		context({ prop: e, bindable: t }) {
			return {
				checked: t(() => ({
					defaultValue: e("defaultChecked"),
					value: e("checked"),
					onChange(t) {
						e("onCheckedChange")?.({ checked: t });
					}
				})),
				fieldsetDisabled: t(() => ({ defaultValue: !1 })),
				focusVisible: t(() => ({ defaultValue: !1 })),
				active: t(() => ({ defaultValue: !1 })),
				focused: t(() => ({ defaultValue: !1 })),
				hovered: t(() => ({ defaultValue: !1 }))
			};
		},
		watch({ track: e, context: t, prop: n, action: r }) {
			e([() => n("disabled")], () => {
				r(["removeFocusIfNeeded"]);
			}), e([() => t.get("checked")], () => {
				r(["syncInputElement"]);
			});
		},
		effects: [
			"trackFormControlState",
			"trackPressEvent",
			"trackFocusVisible"
		],
		on: {
			"CHECKED.TOGGLE": [{
				guard: Xh("isTrusted"),
				actions: ["toggleChecked", "dispatchChangeEvent"]
			}, { actions: ["toggleChecked"] }],
			"CHECKED.SET": [{
				guard: Xh("isTrusted"),
				actions: ["setChecked", "dispatchChangeEvent"]
			}, { actions: ["setChecked"] }],
			"CONTEXT.SET": { actions: ["setContext"] }
		},
		computed: {
			indeterminate: ({ context: e }) => Jh(e.get("checked")),
			checked: ({ context: e }) => Yh(e.get("checked")),
			disabled: ({ context: e, prop: t }) => !!t("disabled") || e.get("fieldsetDisabled")
		},
		states: { ready: {} },
		implementations: {
			guards: { isTrusted: ({ event: e }) => !!e.isTrusted },
			effects: {
				trackPressEvent({ context: e, computed: t, scope: n }) {
					if (!t("disabled")) return qu({
						pointerNode: Uh(n),
						keyboardNode: Wh(n),
						isValidKey: (e) => e.key === " ",
						onPress: () => e.set("active", !1),
						onPressStart: () => e.set("active", !0),
						onPressEnd: () => e.set("active", !1)
					});
				},
				trackFocusVisible({ computed: e, scope: t }) {
					if (!e("disabled")) return kh({ root: t.getRootNode?.() });
				},
				trackFormControlState({ context: e, scope: t }) {
					return Xl(Wh(t), {
						onFieldsetDisabledChange(t) {
							e.set("fieldsetDisabled", t);
						},
						onFormReset() {
							e.set("checked", e.initial("checked"));
						}
					});
				}
			},
			actions: {
				setContext({ context: e, event: t }) {
					for (let n in t.context) e.set(n, t.context[n]);
				},
				syncInputElement({ context: e, computed: t, scope: n }) {
					let r = Wh(n);
					r && (Gl(r, t("checked")), r.indeterminate = Jh(e.get("checked")));
				},
				removeFocusIfNeeded({ context: e, prop: t }) {
					t("disabled") && e.get("focused") && (e.set("focused", !1), e.set("focusVisible", !1));
				},
				setChecked({ context: e, event: t }) {
					e.set("checked", t.checked);
				},
				toggleChecked({ context: e, computed: t }) {
					let n = Jh(t("checked")) ? !0 : !t("checked");
					e.set("checked", n);
				},
				dispatchChangeEvent({ computed: e, scope: t }) {
					queueMicrotask(() => {
						Kl(Wh(t), { checked: e("checked") });
					});
				}
			}
		}
	});
})), $h = t((() => {})), eg = t((() => {
	qh(), Qh(), $h();
})), tg, ng, rg = t((() => {
	lc(), tg = ac("radio-group").parts("root", "label", "item", "itemText", "itemControl", "indicator"), ng = tg.build();
})), ig, ag, og, sg, cg, lg, ug, dg, fg, pg, mg, hg, gg, _g, vg, yg = t((() => {
	Y(), ig = (e) => e.ids?.root ?? `radio-group:${e.id}`, ag = (e) => e.ids?.label ?? `radio-group:${e.id}:label`, og = (e, t) => e.ids?.item?.(t) ?? `radio-group:${e.id}:radio:${t}`, sg = (e, t) => e.ids?.itemHiddenInput?.(t) ?? `radio-group:${e.id}:radio:input:${t}`, cg = (e, t) => e.ids?.itemControl?.(t) ?? `radio-group:${e.id}:radio:control:${t}`, lg = (e, t) => e.ids?.itemLabel?.(t) ?? `radio-group:${e.id}:radio:label:${t}`, ug = (e) => e.ids?.indicator ?? `radio-group:${e.id}:indicator`, dg = (e) => e.getById(ig(e)), fg = (e, t) => e.getById(sg(e, t)), pg = (e) => e.getById(ug(e)), mg = (e) => dg(e)?.querySelector("input:not(:disabled)"), hg = (e) => dg(e)?.querySelector("input:not(:disabled):checked"), gg = (e) => {
		let t = `input[type=radio][data-ownedby='${CSS.escape(ig(e))}']:not([disabled])`;
		return Xu(dg(e), t);
	}, _g = (e, t) => {
		if (t) return e.getById(og(e, t));
	}, vg = (e) => ({
		x: e?.offsetLeft ?? 0,
		y: e?.offsetTop ?? 0,
		width: e?.offsetWidth ?? 0,
		height: e?.offsetHeight ?? 0
	});
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+radio-group@1.42.0/node_modules/@zag-js/radio-group/dist/radio-group.connect.mjs
function bg(e, t) {
	let { context: n, send: r, computed: i, prop: a, scope: o } = e, s = i("isDisabled"), c = a("invalid"), l = a("readOnly");
	function u(e) {
		return {
			value: e.value,
			invalid: !!e.invalid || !!c,
			disabled: !!e.disabled || s,
			checked: n.get("value") === e.value,
			focused: n.get("focusedValue") === e.value,
			focusVisible: n.get("focusVisibleValue") === e.value,
			hovered: n.get("hoveredValue") === e.value,
			active: n.get("activeValue") === e.value
		};
	}
	function d(e) {
		let t = u(e);
		return {
			"data-focus": K(t.focused),
			"data-focus-visible": K(t.focusVisible),
			"data-disabled": K(t.disabled),
			"data-readonly": K(l),
			"data-state": t.checked ? "checked" : "unchecked",
			"data-hover": K(t.hovered),
			"data-invalid": K(t.invalid),
			"data-orientation": a("orientation"),
			"data-ssr": K(n.get("ssr"))
		};
	}
	let f = () => {
		(hg(o) ?? mg(o))?.focus();
	};
	return {
		focus: f,
		value: n.get("value"),
		setValue(e) {
			r({
				type: "SET_VALUE",
				value: e,
				isTrusted: !1
			});
		},
		clearValue() {
			r({
				type: "SET_VALUE",
				value: null,
				isTrusted: !1
			});
		},
		getRootProps() {
			return t.element({
				...ng.root.attrs,
				role: "radiogroup",
				id: ig(o),
				"aria-labelledby": ag(o),
				"aria-required": a("required") || void 0,
				"aria-disabled": s || void 0,
				"aria-readonly": l || void 0,
				"data-orientation": a("orientation"),
				"data-disabled": K(s),
				"data-invalid": K(c),
				"data-required": K(a("required")),
				"aria-orientation": a("orientation"),
				dir: a("dir"),
				style: { position: "relative" }
			});
		},
		getLabelProps() {
			return t.element({
				...ng.label.attrs,
				dir: a("dir"),
				"data-orientation": a("orientation"),
				"data-disabled": K(s),
				"data-invalid": K(c),
				"data-required": K(a("required")),
				id: ag(o),
				onClick: f
			});
		},
		getItemState: u,
		getItemProps(e) {
			let n = u(e);
			return t.label({
				...ng.item.attrs,
				dir: a("dir"),
				id: og(o, e.value),
				htmlFor: sg(o, e.value),
				...d(e),
				onPointerMove() {
					n.disabled || n.hovered || r({
						type: "SET_HOVERED",
						value: e.value,
						hovered: !0
					});
				},
				onPointerLeave() {
					n.disabled || r({
						type: "SET_HOVERED",
						value: null
					});
				},
				onPointerDown(t) {
					n.disabled || Nl(t) && (n.focused && t.pointerType === "mouse" && t.preventDefault(), r({
						type: "SET_ACTIVE",
						value: e.value,
						active: !0
					}));
				},
				onPointerUp() {
					n.disabled || r({
						type: "SET_ACTIVE",
						value: null
					});
				},
				onClick() {
					!n.disabled && _l() && fg(o, e.value)?.focus();
				}
			});
		},
		getItemTextProps(e) {
			return t.element({
				...ng.itemText.attrs,
				dir: a("dir"),
				id: lg(o, e.value),
				...d(e)
			});
		},
		getItemControlProps(e) {
			let n = u(e);
			return t.element({
				...ng.itemControl.attrs,
				dir: a("dir"),
				id: cg(o, e.value),
				"data-active": K(n.active),
				"aria-hidden": !0,
				...d(e)
			});
		},
		getItemHiddenInputProps(e) {
			let n = u(e);
			return t.input({
				"data-ownedby": ig(o),
				id: sg(o, e.value),
				type: "radio",
				name: a("name") || a("id"),
				form: a("form"),
				value: e.value,
				required: a("required"),
				"aria-labelledby": lg(o, e.value),
				"aria-invalid": n.invalid || void 0,
				onClick(t) {
					if (l) {
						t.preventDefault();
						return;
					}
					t.currentTarget.checked && r({
						type: "SET_VALUE",
						value: e.value,
						isTrusted: !0
					});
				},
				onBlur() {
					r({
						type: "SET_FOCUSED",
						value: null,
						focused: !1,
						focusVisible: !1
					});
				},
				onFocus() {
					let t = Oh();
					r({
						type: "SET_FOCUSED",
						value: e.value,
						focused: !0,
						focusVisible: t
					});
				},
				onKeyDown(t) {
					t.defaultPrevented || t.key === " " && r({
						type: "SET_ACTIVE",
						value: e.value,
						active: !0
					});
				},
				onKeyUp(e) {
					e.defaultPrevented || e.key === " " && r({
						type: "SET_ACTIVE",
						value: null
					});
				},
				disabled: n.disabled || l,
				defaultChecked: n.checked,
				style: Dd
			});
		},
		getIndicatorProps() {
			let e = n.get("indicatorRect"), i = n.get("animateIndicator");
			return t.element({
				id: ug(o),
				...ng.indicator.attrs,
				dir: a("dir"),
				hidden: n.get("value") == null || xg(e),
				"data-disabled": K(s),
				"data-orientation": a("orientation"),
				onTransitionEnd(e) {
					Sl(e) === e.currentTarget && r({ type: "INDICATOR_TRANSITION_END" });
				},
				style: {
					"--transition-property": "left, top, width, height",
					"--left": Kf(e?.x),
					"--top": Kf(e?.y),
					"--width": Kf(e?.width),
					"--height": Kf(e?.height),
					position: "absolute",
					willChange: i ? "var(--transition-property)" : "auto",
					transitionProperty: i ? "var(--transition-property)" : "none",
					transitionDuration: i ? "var(--transition-duration, 150ms)" : "0ms",
					transitionTimingFunction: "var(--transition-timing-function)",
					[a("orientation") === "horizontal" ? "left" : "top"]: a("orientation") === "horizontal" ? "var(--left)" : "var(--top)"
				}
			});
		}
	};
}
var xg, Sg = t((() => {
	Y(), Rh(), X(), rg(), yg(), xg = (e) => e == null || e.width === 0 && e.height === 0 && e.x === 0 && e.y === 0;
})), Cg, wg, Tg = t((() => {
	um(), Y(), Rh(), yg(), {not: Cg} = tm(), wg = nm({
		props({ props: e }) {
			return {
				orientation: "vertical",
				...e
			};
		},
		initialState() {
			return "idle";
		},
		context({ prop: e, bindable: t }) {
			return {
				value: t(() => ({
					defaultValue: e("defaultValue"),
					value: e("value"),
					onChange(t) {
						e("onValueChange")?.({ value: t });
					}
				})),
				activeValue: t(() => ({ defaultValue: null })),
				focusedValue: t(() => ({ defaultValue: null })),
				focusVisibleValue: t(() => ({ defaultValue: null })),
				hoveredValue: t(() => ({ defaultValue: null })),
				indicatorRect: t(() => ({ defaultValue: null })),
				animateIndicator: t(() => ({ defaultValue: !1 })),
				fieldsetDisabled: t(() => ({ defaultValue: !1 })),
				ssr: t(() => ({ defaultValue: !0 }))
			};
		},
		refs() {
			return {
				indicatorCleanup: null,
				focusVisibleValue: null,
				prevValue: null
			};
		},
		computed: { isDisabled: ({ prop: e, context: t }) => !!e("disabled") || t.get("fieldsetDisabled") },
		entry: [
			"syncPrevValue",
			"syncIndicatorRect",
			"syncSsr"
		],
		exit: ["cleanupObserver"],
		effects: ["trackFormControlState", "trackFocusVisible"],
		watch({ track: e, action: t, context: n }) {
			e([() => n.get("value")], () => {
				t([
					"syncIndicatorAnimation",
					"syncIndicatorRect",
					"syncInputElements"
				]);
			});
		},
		on: {
			SET_VALUE: [{
				guard: Cg("isTrusted"),
				actions: ["setValue", "dispatchChangeEvent"]
			}, { actions: ["setValue"] }],
			SET_HOVERED: { actions: ["setHovered"] },
			SET_ACTIVE: { actions: ["setActive"] },
			SET_FOCUSED: { actions: ["setFocused"] },
			INDICATOR_TRANSITION_END: { actions: ["clearIndicatorAnimation"] }
		},
		states: { idle: {} },
		implementations: {
			guards: { isTrusted: ({ event: e }) => !!e.isTrusted },
			effects: {
				trackFormControlState({ context: e, scope: t }) {
					return Xl(dg(t), {
						onFieldsetDisabledChange(t) {
							e.set("fieldsetDisabled", t);
						},
						onFormReset() {
							e.set("value", e.initial("value"));
						}
					});
				},
				trackFocusVisible({ scope: e }) {
					return kh({ root: e.getRootNode?.() });
				}
			},
			actions: {
				setValue({ context: e, event: t }) {
					e.set("value", t.value);
				},
				setHovered({ context: e, event: t }) {
					e.set("hoveredValue", t.value);
				},
				setActive({ context: e, event: t }) {
					e.set("activeValue", t.value);
				},
				setFocused({ context: e, event: t }) {
					e.set("focusedValue", t.value);
					let n = t.value != null && t.focusVisible ? t.value : null;
					e.set("focusVisibleValue", n);
				},
				syncPrevValue({ context: e, refs: t }) {
					t.set("prevValue", e.get("value"));
				},
				syncIndicatorAnimation({ context: e, refs: t }) {
					let n = t.get("prevValue"), r = e.get("value"), i = n != null && r != null && n !== r;
					e.set("animateIndicator", i), t.set("prevValue", r);
				},
				clearIndicatorAnimation({ context: e }) {
					e.set("animateIndicator", !1);
				},
				syncInputElements({ context: e, scope: t }) {
					gg(t).forEach((t) => {
						t.checked = t.value === e.get("value");
					});
				},
				cleanupObserver({ refs: e }) {
					e.get("indicatorCleanup")?.();
				},
				syncSsr({ context: e }) {
					e.set("ssr", !1);
				},
				syncIndicatorRect({ context: e, scope: t, refs: n }) {
					if (n.get("indicatorCleanup")?.(), !pg(t)) return;
					let r = e.get("value"), i = _g(t, r);
					if (r == null || !i) {
						e.set("indicatorRect", null);
						return;
					}
					let a = () => {
						e.set("indicatorRect", vg(i));
					};
					a();
					let o = ad.observe(i, a);
					n.set("indicatorCleanup", o);
				},
				dispatchChangeEvent({ context: e, scope: t }) {
					gg(t).forEach((t) => {
						let n = t.value === e.get("value");
						n !== t.checked && Kl(t, { checked: n });
					});
				}
			}
		}
	});
})), Eg = t((() => {})), Dg = t((() => {
	Sg(), Tg(), Eg();
})), Og, kg, Ag = t((() => {
	lc(), Og = ac("select").parts("label", "positioner", "trigger", "indicator", "clearTrigger", "item", "itemText", "itemIndicator", "itemGroup", "itemGroupLabel", "list", "content", "root", "control", "valueText"), kg = Og.build();
})), jg, Mg, Z, Ng = t((() => {
	jg = Object.defineProperty, Mg = (e, t, n) => t in e ? jg(e, t, {
		enumerable: !0,
		configurable: !0,
		writable: !0,
		value: n
	}) : e[t] = n, Z = (e, t, n) => Mg(e, typeof t == "symbol" ? t : t + "", n);
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+collection@1.42.0/node_modules/@zag-js/collection/dist/list-collection.mjs
function Pg(e, t, ...n) {
	return [
		...e.slice(0, t),
		...n,
		...e.slice(t)
	];
}
function Fg(e, t, n) {
	t = [...t].sort((e, t) => e - t);
	let r = t.map((t) => e[t]);
	for (let n = t.length - 1; n >= 0; n--) e = [...e.slice(0, t[n]), ...e.slice(t[n] + 1)];
	return n = Math.max(0, n - t.filter((e) => e < n).length), [
		...e.slice(0, n),
		...r,
		...e.slice(n)
	];
}
var Ig, Lg, Rg, zg = t((() => {
	Ng(), X(), Ig = {
		itemToValue(e) {
			return typeof e == "string" ? e : nf(e) && sf(e, "value") ? e.value : "";
		},
		itemToString(e) {
			return typeof e == "string" ? e : nf(e) && sf(e, "label") ? e.label : Ig.itemToValue(e);
		},
		isItemDisabled(e) {
			return nf(e) && sf(e, "disabled") ? !!e.disabled : !1;
		}
	}, Lg = class e {
		constructor(t) {
			Z(this, "options", t), Z(this, "items"), Z(this, "indexMap", null), Z(this, "copy", (t) => new e({
				...this.options,
				items: t ?? [...this.items]
			})), Z(this, "isEqual", (e) => Zd(this.items, e.items)), Z(this, "setItems", (e) => this.copy(e)), Z(this, "getValues", (e = this.items) => {
				let t = [];
				for (let n of e) {
					let e = this.getItemValue(n);
					e != null && t.push(e);
				}
				return t;
			}), Z(this, "find", (e) => {
				if (e == null) return null;
				let t = this.indexOf(e);
				return t === -1 ? null : this.at(t);
			}), Z(this, "findMany", (e) => {
				let t = [];
				for (let n of e) {
					let e = this.find(n);
					e != null && t.push(e);
				}
				return t;
			}), Z(this, "at", (e) => {
				if (!this.options.groupBy && !this.options.groupSort) return this.items[e] ?? null;
				let t = 0, n = this.group();
				for (let [, r] of n) for (let n of r) {
					if (t === e) return n;
					t++;
				}
				return null;
			}), Z(this, "sortFn", (e, t) => {
				let n = this.indexOf(e), r = this.indexOf(t);
				return (n ?? 0) - (r ?? 0);
			}), Z(this, "sort", (e) => [...e].sort(this.sortFn.bind(this))), Z(this, "getItemValue", (e) => e == null ? null : this.options.itemToValue?.(e) ?? Ig.itemToValue(e)), Z(this, "getItemDisabled", (e) => e == null ? !1 : this.options.isItemDisabled?.(e) ?? Ig.isItemDisabled(e)), Z(this, "stringifyItem", (e) => e == null ? null : this.options.itemToString?.(e) ?? Ig.itemToString(e)), Z(this, "stringify", (e) => e == null ? null : this.stringifyItem(this.find(e))), Z(this, "stringifyItems", (e, t = ", ") => {
				let n = [];
				for (let t of e) {
					let e = this.stringifyItem(t);
					e != null && n.push(e);
				}
				return n.join(t);
			}), Z(this, "stringifyMany", (e, t) => this.stringifyItems(this.findMany(e), t)), Z(this, "has", (e) => this.indexOf(e) !== -1), Z(this, "hasItem", (e) => e != null && this.has(this.getItemValue(e))), Z(this, "group", () => {
				let { groupBy: e, groupSort: t } = this.options;
				if (!e) return [["", [...this.items]]];
				let n = /* @__PURE__ */ new Map();
				this.items.forEach((t, r) => {
					let i = e(t, r);
					n.has(i) || n.set(i, []), n.get(i).push(t);
				});
				let r = Array.from(n.entries());
				return t && r.sort(([e], [n]) => {
					if (typeof t == "function") return t(e, n);
					if (Array.isArray(t)) {
						let r = t.indexOf(e), i = t.indexOf(n);
						return r === -1 ? 1 : i === -1 ? -1 : r - i;
					}
					return t === "asc" ? e.localeCompare(n) : t === "desc" ? n.localeCompare(e) : 0;
				}), r;
			}), Z(this, "getNextValue", (e, t = 1, n = !1) => {
				let r = this.indexOf(e);
				if (r === -1) return null;
				for (r = n ? Math.min(r + t, this.size - 1) : r + t; r <= this.size && this.getItemDisabled(this.at(r));) r++;
				return this.getItemValue(this.at(r));
			}), Z(this, "getPreviousValue", (e, t = 1, n = !1) => {
				let r = this.indexOf(e);
				if (r === -1) return null;
				for (r = n ? Math.max(r - t, 0) : r - t; r >= 0 && this.getItemDisabled(this.at(r));) r--;
				return this.getItemValue(this.at(r));
			}), Z(this, "indexOf", (e) => {
				if (e == null) return -1;
				if (!this.options.groupBy && !this.options.groupSort) return this.items.findIndex((t) => this.getItemValue(t) === e);
				if (!this.indexMap) {
					this.indexMap = /* @__PURE__ */ new Map();
					let e = 0, t = this.group();
					for (let [, n] of t) for (let t of n) {
						let n = this.getItemValue(t);
						n != null && this.indexMap.set(n, e), e++;
					}
				}
				return this.indexMap.get(e) ?? -1;
			}), Z(this, "getByText", (e, t) => {
				let n = t == null ? -1 : this.indexOf(t), r = e.length === 1;
				for (let i = 0; i < this.items.length; i++) {
					let a = this.items[(n + i + 1) % this.items.length];
					if (!(r && this.getItemValue(a) === t) && !this.getItemDisabled(a) && Rg(this.stringifyItem(a), e)) return a;
				}
			}), Z(this, "search", (e, t) => {
				let { state: n, currentValue: r, timeout: i = 350 } = t, a = n.keysSoFar + e, o = a.length > 1 && Array.from(a).every((e) => e === a[0]) ? a[0] : a, s = this.getByText(o, r), c = this.getItemValue(s);
				function l() {
					clearTimeout(n.timer), n.timer = -1;
				}
				function u(e) {
					n.keysSoFar = e, l(), e !== "" && (n.timer = +setTimeout(() => {
						u(""), l();
					}, i));
				}
				return u(a), c;
			}), Z(this, "update", (e, t) => {
				let n = this.indexOf(e);
				return n === -1 ? this : this.copy([
					...this.items.slice(0, n),
					t,
					...this.items.slice(n + 1)
				]);
			}), Z(this, "upsert", (e, t, n = "append") => {
				let r = this.indexOf(e);
				return r === -1 ? (n === "append" ? this.append : this.prepend)(t) : this.copy([
					...this.items.slice(0, r),
					t,
					...this.items.slice(r + 1)
				]);
			}), Z(this, "insert", (e, ...t) => this.copy(Pg(this.items, e, ...t))), Z(this, "insertBefore", (e, ...t) => {
				let n = this.indexOf(e);
				if (n === -1) if (this.items.length === 0) n = 0;
				else return this;
				return this.copy(Pg(this.items, n, ...t));
			}), Z(this, "insertAfter", (e, ...t) => {
				let n = this.indexOf(e);
				if (n === -1) if (this.items.length === 0) n = 0;
				else return this;
				return this.copy(Pg(this.items, n + 1, ...t));
			}), Z(this, "prepend", (...e) => this.copy(Pg(this.items, 0, ...e))), Z(this, "append", (...e) => this.copy(Pg(this.items, this.items.length, ...e))), Z(this, "filter", (e) => {
				let t = this.items.filter((t, n) => e(this.stringifyItem(t), n, t));
				return this.copy(t);
			}), Z(this, "remove", (...e) => {
				let t = e.map((e) => typeof e == "string" ? e : this.getItemValue(e));
				return this.copy(this.items.filter((e) => {
					let n = this.getItemValue(e);
					return n != null && !t.includes(n);
				}));
			}), Z(this, "move", (e, t) => {
				let n = this.indexOf(e);
				return n === -1 ? this : this.copy(Fg(this.items, [n], t));
			}), Z(this, "moveBefore", (e, ...t) => {
				let n = this.items.findIndex((t) => this.getItemValue(t) === e);
				if (n === -1) return this;
				let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
				return this.copy(Fg(this.items, r, n));
			}), Z(this, "moveAfter", (e, ...t) => {
				let n = this.items.findIndex((t) => this.getItemValue(t) === e);
				if (n === -1) return this;
				let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
				return this.copy(Fg(this.items, r, n + 1));
			}), Z(this, "reorder", (e, t) => this.copy(Fg(this.items, [e], t))), Z(this, "compareValue", (e, t) => {
				let n = this.indexOf(e), r = this.indexOf(t);
				return n < r ? -1 : +(n > r);
			}), Z(this, "range", (e, t) => {
				let n = [], r = e;
				for (; r != null;) {
					if (this.find(r) && n.push(r), r === t) return n;
					r = this.getNextValue(r);
				}
				return [];
			}), Z(this, "getValueRange", (e, t) => e && t ? this.compareValue(e, t) <= 0 ? this.range(e, t) : this.range(t, e) : []), Z(this, "toString", () => {
				let e = "";
				for (let t of this.items) {
					let n = [
						this.getItemValue(t),
						this.stringifyItem(t),
						this.getItemDisabled(t)
					].filter(Boolean).join(":");
					e += n + ",";
				}
				return e;
			}), Z(this, "toJSON", () => ({
				size: this.size,
				first: this.firstValue,
				last: this.lastValue
			})), this.items = [...t.items];
		}
		get size() {
			return this.items.length;
		}
		get firstValue() {
			let e = 0;
			for (; this.getItemDisabled(this.at(e));) e++;
			return this.getItemValue(this.at(e));
		}
		get lastValue() {
			let e = this.size - 1;
			for (; this.getItemDisabled(this.at(e));) e--;
			return this.getItemValue(this.at(e));
		}
		*[Symbol.iterator]() {
			yield* this.items;
		}
	}, Rg = (e, t) => !!e?.toLowerCase().startsWith(t.toLowerCase());
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+collection@1.42.0/node_modules/@zag-js/collection/dist/selection-map.mjs
function Bg({ values: e, collection: t, selectedItemMap: n }) {
	let r = [];
	for (let i of e) {
		let e = t.find(i) ?? n.get(i);
		e != null && r.push(e);
	}
	return r;
}
function Vg({ selectedItemMap: e, values: t, selectedItems: n, collection: r }) {
	let i = new Map(e);
	for (let e of n) {
		let t = r.getItemValue(e);
		t != null && i.set(t, e);
	}
	let a = new Set(t);
	for (let e of i.keys()) a.has(e) || i.delete(e);
	return i;
}
function Hg({ values: e, collection: t, selectedItemMap: n }) {
	let r = Bg({
		values: e,
		collection: t,
		selectedItemMap: n
	});
	return {
		selectedItems: r,
		nextSelectedItemMap: Vg({
			selectedItemMap: n,
			values: e,
			selectedItems: r,
			collection: t
		})
	};
}
function Ug({ selectedItems: e, collection: t }) {
	return Vg({
		selectedItemMap: /* @__PURE__ */ new Map(),
		values: e.map((e) => t.getItemValue(e)).filter(Boolean),
		selectedItems: e,
		collection: t
	});
}
var Wg = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+collection@1.42.0/node_modules/@zag-js/collection/dist/tree-visit.mjs
function Gg(e, t, n) {
	for (let r = 0; r < t.length; r++) e = n.getChildren(e, t.slice(r + 1))[t[r]];
	return e;
}
function Kg(e) {
	let t = Jg(e), n = [], r = /* @__PURE__ */ new Set();
	for (let e of t) {
		let t = e.join();
		r.has(t) || (r.add(t), n.push(e));
	}
	return n;
}
function qg(e, t) {
	for (let n = 0; n < Math.min(e.length, t.length); n++) {
		if (e[n] < t[n]) return -1;
		if (e[n] > t[n]) return 1;
	}
	return e.length - t.length;
}
function Jg(e) {
	return e.sort(qg);
}
function Yg(e, t) {
	let n;
	return g_(e, {
		...t,
		onEnter: (e, r) => {
			if (t.predicate(e, r)) return n = e, "stop";
		}
	}), n;
}
function Xg(e, t) {
	let n = [];
	return g_(e, {
		onEnter: (e, r) => {
			t.predicate(e, r) && n.push(e);
		},
		getChildren: t.getChildren
	}), n;
}
function Zg(e, t) {
	let n;
	return g_(e, {
		onEnter: (e, r) => {
			if (t.predicate(e, r)) return n = [...r], "stop";
		},
		getChildren: t.getChildren
	}), n;
}
function Qg(e, t) {
	let n = t.initialResult;
	return g_(e, {
		...t,
		onEnter: (e, r) => {
			n = t.nextResult(n, e, r);
		}
	}), n;
}
function $g(e, t) {
	return Qg(e, {
		...t,
		initialResult: [],
		nextResult: (e, n, r) => (e.push(...t.transform(n, r)), e)
	});
}
function e_(e, t) {
	let { predicate: n, create: r, getChildren: i } = t, a = (e, t) => {
		let o = i(e, t), s = [];
		o.forEach((e, n) => {
			let r = [...t, n], i = a(e, r);
			i && s.push(i);
		});
		let c = t.length === 0, l = n(e, t), u = s.length > 0;
		return c || l || u ? r(e, s, t) : null;
	};
	return a(e, []) || r(e, [], []);
}
function t_(e, t) {
	let n = [], r = 0, i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
	return g_(e, {
		getChildren: t.getChildren,
		onEnter: (e, o) => {
			i.has(e) || i.set(e, r++);
			let s = t.getChildren(e, o);
			s.forEach((t) => {
				a.has(t) || a.set(t, e), i.has(t) || i.set(t, r++);
			});
			let c = s.length > 0 ? s.map((e) => i.get(e)) : void 0, l = a.get(e), u = l ? i.get(l) : void 0, d = i.get(e);
			n.push({
				...e,
				_children: c,
				_parent: u,
				_index: d
			});
		}
	}), n;
}
function n_(e, t) {
	return {
		type: "insert",
		index: e,
		nodes: t
	};
}
function r_(e) {
	return {
		type: "remove",
		indexes: e
	};
}
function i_() {
	return { type: "replace" };
}
function a_(e) {
	return [e.slice(0, -1), e[e.length - 1]];
}
function o_(e, t, n = /* @__PURE__ */ new Map()) {
	let [r, i] = a_(e);
	for (let e = r.length - 1; e >= 0; e--) {
		let t = r.slice(0, e).join();
		switch (n.get(t)?.type) {
			case "remove": continue;
		}
		n.set(t, i_());
	}
	let a = n.get(r.join());
	switch (a?.type) {
		case "remove":
			n.set(r.join(), {
				type: "removeThenInsert",
				removeIndexes: a.indexes,
				insertIndex: i,
				insertNodes: t
			});
			break;
		default: n.set(r.join(), n_(i, t));
	}
	return n;
}
function s_(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = t.slice(0, -1).join(), r = n.get(e) ?? [];
		r.push(t[t.length - 1]), n.set(e, r.sort((e, t) => e - t));
	}
	for (let n of e) for (let e = n.length - 2; e >= 0; e--) {
		let r = n.slice(0, e).join();
		t.has(r) || t.set(r, i_());
	}
	for (let [e, r] of n) t.set(e, r_(r));
	return t;
}
function c_(e, t) {
	let n = /* @__PURE__ */ new Map(), [r, i] = a_(e);
	for (let e = r.length - 1; e >= 0; e--) {
		let t = r.slice(0, e).join();
		n.set(t, i_());
	}
	return n.set(r.join(), {
		type: "removeThenInsert",
		removeIndexes: [i],
		insertIndex: i,
		insertNodes: [t]
	}), n;
}
function l_(e, t, n) {
	return d_(e, {
		...n,
		getChildren: (e, r) => {
			let i = r.join();
			switch (t.get(i)?.type) {
				case "replace":
				case "remove":
				case "removeThenInsert":
				case "insert": return n.getChildren(e, r);
				default: return [];
			}
		},
		transform: (e, r, i) => {
			let a = i.join(), o = t.get(a);
			switch (o?.type) {
				case "remove": return n.create(e, r.filter((e, t) => !o.indexes.includes(t)), i);
				case "removeThenInsert":
					let t = r.filter((e, t) => !o.removeIndexes.includes(t)), a = o.removeIndexes.reduce((e, t) => t < e ? e - 1 : e, o.insertIndex);
					return n.create(e, u_(t, a, 0, ...o.insertNodes), i);
				case "insert": return n.create(e, u_(r, o.index, 0, ...o.nodes), i);
				case "replace": return n.create(e, r, i);
				default: return e;
			}
		}
	});
}
function u_(e, t, n, ...r) {
	return [
		...e.slice(0, t),
		...r,
		...e.slice(t + n)
	];
}
function d_(e, t) {
	let n = {};
	return g_(e, {
		...t,
		onLeave: (e, r) => {
			let i = [0, ...r], a = i.join(), o = t.transform(e, n[a] ?? [], r), s = i.slice(0, -1).join(), c = n[s] ?? [];
			c.push(o), n[s] = c;
		}
	}), n[""][0];
}
function f_(e, t) {
	let { nodes: n, at: r } = t;
	if (r.length === 0) throw Error("Can't insert nodes at the root");
	return l_(e, o_(r, n), t);
}
function p_(e, t) {
	return t.at.length === 0 ? t.node : l_(e, c_(t.at, t.node), t);
}
function m_(e, t) {
	if (t.indexPaths.length === 0) return e;
	for (let e of t.indexPaths) if (e.length === 0) throw Error("Can't remove the root node");
	return l_(e, s_(t.indexPaths), t);
}
function h_(e, t) {
	if (t.indexPaths.length === 0) return e;
	for (let e of t.indexPaths) if (e.length === 0) throw Error("Can't move the root node");
	if (t.to.length === 0) throw Error("Can't move nodes to the root");
	let n = Kg(t.indexPaths), r = n.map((n) => Gg(e, n, t));
	return l_(e, o_(t.to, r, s_(n)), t);
}
function g_(e, t) {
	let { onEnter: n, onLeave: r, getChildren: i } = t, a = [], o = [{ node: e }], s = t.reuseIndexPath ? () => a : () => a.slice();
	for (; o.length > 0;) {
		let e = o[o.length - 1];
		if (e.state === void 0) {
			let t = n?.(e.node, s());
			if (t === "stop") return;
			e.state = t === "skip" ? -1 : 0;
		}
		let t = e.children || i(e.node, s());
		if (e.children ||= t, e.state !== -1) {
			if (e.state < t.length) {
				let n = e.state;
				a.push(n), o.push({ node: t[n] }), e.state = n + 1;
				continue;
			}
			if (r?.(e.node, s()) === "stop") return;
		}
		a.pop(), o.pop();
	}
}
var __ = t((() => {})), v_, y_, b_ = t((() => {
	Ng(), X(), __(), v_ = class e {
		constructor(t) {
			Z(this, "options", t), Z(this, "rootNode"), Z(this, "isEqual", (e) => Zd(this.rootNode, e.rootNode)), Z(this, "getNodeChildren", (e) => this.options.nodeToChildren?.(e) ?? y_.nodeToChildren(e) ?? []), Z(this, "resolveIndexPath", (e) => typeof e == "string" ? this.getIndexPath(e) : e), Z(this, "resolveNode", (e) => {
				let t = this.resolveIndexPath(e);
				return t ? this.at(t) : void 0;
			}), Z(this, "getNodeChildrenCount", (e) => this.options.nodeToChildrenCount?.(e) ?? y_.nodeToChildrenCount(e)), Z(this, "getNodeValue", (e) => this.options.nodeToValue?.(e) ?? y_.nodeToValue(e)), Z(this, "getNodeDisabled", (e) => this.options.isNodeDisabled?.(e) ?? y_.isNodeDisabled(e)), Z(this, "stringify", (e) => {
				let t = this.findNode(e);
				return t ? this.stringifyNode(t) : null;
			}), Z(this, "stringifyNode", (e) => this.options.nodeToString?.(e) ?? y_.nodeToString(e)), Z(this, "getFirstNode", (e = this.rootNode, t = {}) => {
				let n;
				return g_(e, {
					getChildren: this.getNodeChildren,
					onEnter: (r, i) => {
						if (!this.isSameNode(r, e)) {
							if (t.skip?.({
								value: this.getNodeValue(r),
								node: r,
								indexPath: i
							})) return "skip";
							if (!n && i.length > 0 && !this.getNodeDisabled(r)) return n = r, "stop";
						}
					}
				}), n;
			}), Z(this, "getLastNode", (e = this.rootNode, t = {}) => {
				let n;
				return g_(e, {
					getChildren: this.getNodeChildren,
					onEnter: (r, i) => {
						if (!this.isSameNode(r, e)) {
							if (t.skip?.({
								value: this.getNodeValue(r),
								node: r,
								indexPath: i
							})) return "skip";
							i.length > 0 && !this.getNodeDisabled(r) && (n = r);
						}
					}
				}), n;
			}), Z(this, "at", (e) => Gg(this.rootNode, e, { getChildren: this.getNodeChildren })), Z(this, "findNode", (e, t = this.rootNode) => Yg(t, {
				getChildren: this.getNodeChildren,
				predicate: (t) => this.getNodeValue(t) === e
			})), Z(this, "findNodes", (e, t = this.rootNode) => {
				let n = new Set(e.filter((e) => e != null));
				return Xg(t, {
					getChildren: this.getNodeChildren,
					predicate: (e) => n.has(this.getNodeValue(e))
				});
			}), Z(this, "sort", (e) => e.reduce((e, t) => {
				let n = this.getIndexPath(t);
				return n && e.push({
					value: t,
					indexPath: n
				}), e;
			}, []).sort((e, t) => qg(e.indexPath, t.indexPath)).map(({ value: e }) => e)), Z(this, "getValue", (e) => {
				let t = this.at(e);
				return t ? this.getNodeValue(t) : void 0;
			}), Z(this, "getValuePath", (e) => {
				if (!e) return [];
				let t = [], n = [...e];
				for (; n.length > 0;) {
					let e = this.at(n);
					e && t.unshift(this.getNodeValue(e)), n.pop();
				}
				return t;
			}), Z(this, "getDepth", (e) => Zg(this.rootNode, {
				getChildren: this.getNodeChildren,
				predicate: (t) => this.getNodeValue(t) === e
			})?.length ?? 0), Z(this, "isSameNode", (e, t) => this.getNodeValue(e) === this.getNodeValue(t)), Z(this, "isRootNode", (e) => this.isSameNode(e, this.rootNode)), Z(this, "contains", (e, t) => !e || !t ? !1 : t.slice(0, e.length).every((n, r) => e[r] === t[r])), Z(this, "getNextNode", (e, t = {}) => {
				let n = !1, r;
				return g_(this.rootNode, {
					getChildren: this.getNodeChildren,
					onEnter: (i, a) => {
						if (this.isRootNode(i)) return;
						let o = this.getNodeValue(i);
						if (t.skip?.({
							value: o,
							node: i,
							indexPath: a
						})) return o === e && (n = !0), "skip";
						if (n && !this.getNodeDisabled(i)) return r = i, "stop";
						o === e && (n = !0);
					}
				}), r;
			}), Z(this, "getPreviousNode", (e, t = {}) => {
				let n, r = !1;
				return g_(this.rootNode, {
					getChildren: this.getNodeChildren,
					onEnter: (i, a) => {
						if (this.isRootNode(i)) return;
						let o = this.getNodeValue(i);
						if (t.skip?.({
							value: o,
							node: i,
							indexPath: a
						})) return "skip";
						if (o === e) return r = !0, "stop";
						this.getNodeDisabled(i) || (n = i);
					}
				}), r ? n : void 0;
			}), Z(this, "getParentNodes", (e) => {
				let t = this.resolveIndexPath(e)?.slice();
				if (!t) return [];
				let n = [];
				for (; t.length > 0;) {
					t.pop();
					let e = this.at(t);
					e && !this.isRootNode(e) && n.unshift(e);
				}
				return n;
			}), Z(this, "getDescendantNodes", (e, t) => {
				let n = this.resolveNode(e);
				if (!n) return [];
				let r = [];
				return g_(n, {
					getChildren: this.getNodeChildren,
					onEnter: (e, n) => {
						n.length !== 0 && (!t?.withBranch && this.isBranchNode(e) || r.push(e));
					}
				}), r;
			}), Z(this, "getDescendantValues", (e, t) => this.getDescendantNodes(e, t).map((e) => this.getNodeValue(e))), Z(this, "getParentIndexPath", (e) => e.slice(0, -1)), Z(this, "getParentNode", (e) => {
				let t = this.resolveIndexPath(e);
				return t ? this.at(this.getParentIndexPath(t)) : void 0;
			}), Z(this, "visit", (e) => {
				let { skip: t, ...n } = e;
				g_(this.rootNode, {
					...n,
					getChildren: this.getNodeChildren,
					onEnter: (e, r) => {
						if (!this.isRootNode(e)) return t?.({
							value: this.getNodeValue(e),
							node: e,
							indexPath: r
						}) ? "skip" : n.onEnter?.(e, r);
					}
				});
			}), Z(this, "getPreviousSibling", (e) => {
				let t = this.getParentNode(e);
				if (!t) return;
				let n = this.getNodeChildren(t), r = e[e.length - 1];
				for (; --r >= 0;) {
					let e = n[r];
					if (!this.getNodeDisabled(e)) return e;
				}
			}), Z(this, "getNextSibling", (e) => {
				let t = this.getParentNode(e);
				if (!t) return;
				let n = this.getNodeChildren(t), r = e[e.length - 1];
				for (; ++r < n.length;) {
					let e = n[r];
					if (!this.getNodeDisabled(e)) return e;
				}
			}), Z(this, "getSiblingNodes", (e) => {
				let t = this.getParentNode(e);
				return t ? this.getNodeChildren(t) : [];
			}), Z(this, "getValues", (e = this.rootNode) => $g(e, {
				getChildren: this.getNodeChildren,
				transform: (e) => [this.getNodeValue(e)]
			}).slice(1)), Z(this, "isValidDepth", (e, t) => t == null ? !0 : typeof t == "function" ? t(e.length) : e.length === t), Z(this, "isBranchNode", (e) => this.getNodeChildren(e).length > 0 || this.getNodeChildrenCount(e) != null), Z(this, "getBranchValues", (e = this.rootNode, t = {}) => {
				let n = [];
				return g_(e, {
					getChildren: this.getNodeChildren,
					onEnter: (e, r) => {
						if (r.length === 0) return;
						let i = this.getNodeValue(e);
						if (t.skip?.({
							value: i,
							node: e,
							indexPath: r
						})) return "skip";
						this.isBranchNode(e) && this.isValidDepth(r, t.depth) && n.push(this.getNodeValue(e));
					}
				}), n;
			}), Z(this, "flatten", (e = this.rootNode) => t_(e, { getChildren: this.getNodeChildren })), Z(this, "_create", (e, t) => this.getNodeChildren(e).length > 0 || t.length > 0 ? {
				...e,
				children: t
			} : { ...e }), Z(this, "_insert", (e, t, n) => this.copy(f_(e, {
				at: t,
				nodes: n,
				getChildren: this.getNodeChildren,
				create: this._create
			}))), Z(this, "copy", (t) => new e({
				...this.options,
				rootNode: t
			})), Z(this, "_replace", (e, t, n) => this.copy(p_(e, {
				at: t,
				node: n,
				getChildren: this.getNodeChildren,
				create: this._create
			}))), Z(this, "_move", (e, t, n) => this.copy(h_(e, {
				indexPaths: t,
				to: n,
				getChildren: this.getNodeChildren,
				create: this._create
			}))), Z(this, "_remove", (e, t) => this.copy(m_(e, {
				indexPaths: t,
				getChildren: this.getNodeChildren,
				create: this._create
			}))), Z(this, "replace", (e, t) => this._replace(this.rootNode, e, t)), Z(this, "remove", (e) => this._remove(this.rootNode, e)), Z(this, "insertBefore", (e, t) => this.getParentNode(e) ? this._insert(this.rootNode, e, t) : void 0), Z(this, "insertAfter", (e, t) => {
				if (!this.getParentNode(e)) return;
				let n = [...e.slice(0, -1), e[e.length - 1] + 1];
				return this._insert(this.rootNode, n, t);
			}), Z(this, "move", (e, t) => this._move(this.rootNode, e, t)), Z(this, "filter", (e) => {
				let t = e_(this.rootNode, {
					predicate: e,
					getChildren: this.getNodeChildren,
					create: this._create
				});
				return this.copy(t);
			}), Z(this, "toJSON", () => this.getValues(this.rootNode)), this.rootNode = t.rootNode;
		}
		getIndexPath(e) {
			if (Array.isArray(e)) {
				if (e.length === 0) return [];
				let t = [], n = this.getNodeChildren(this.rootNode);
				for (let r = 0; r < e.length; r++) {
					let i = e[r], a = n.findIndex((e) => this.getNodeValue(e) === i);
					if (a === -1) break;
					if (t.push(a), r < e.length - 1) {
						let e = n[a];
						n = this.getNodeChildren(e);
					}
				}
				return t;
			} else return Zg(this.rootNode, {
				getChildren: this.getNodeChildren,
				predicate: (t) => this.getNodeValue(t) === e
			});
		}
	}, y_ = {
		nodeToValue(e) {
			return typeof e == "string" ? e : nf(e) && sf(e, "value") ? e.value : "";
		},
		nodeToString(e) {
			return typeof e == "string" ? e : nf(e) && sf(e, "label") ? e.label : y_.nodeToValue(e);
		},
		isNodeDisabled(e) {
			return nf(e) && sf(e, "disabled") ? !!e.disabled : !1;
		},
		nodeToChildren(e) {
			return e.children;
		},
		nodeToChildrenCount(e) {
			if (nf(e) && sf(e, "childrenCount")) return e.childrenCount;
		}
	};
})), x_ = t((() => {
	zg(), Wg(), b_();
})), S_, C_ = t((() => {
	x_(), S_ = (e) => new Lg(e), S_.empty = () => new Lg({ items: [] });
}));
//#endregion
//#region node_modules/.pnpm/@floating-ui+utils@0.2.12/node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
function w_(e, t, n) {
	return U_(e, H_(t, n));
}
function T_(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function E_(e) {
	return e.split("-")[0];
}
function D_(e) {
	return e.split("-")[1];
}
function O_(e) {
	return e === "x" ? "y" : "x";
}
function k_(e) {
	return e === "y" ? "height" : "width";
}
function A_(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function j_(e) {
	return O_(A_(e));
}
function M_(e, t, n) {
	n === void 0 && (n = !1);
	let r = D_(e), i = j_(e), a = k_(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = L_(o)), [o, L_(o)];
}
function N_(e) {
	let t = L_(e);
	return [
		P_(e),
		t,
		P_(t)
	];
}
function P_(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
function F_(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? Y_ : J_ : t ? J_ : Y_;
		case "left":
		case "right": return t ? X_ : Z_;
		default: return [];
	}
}
function I_(e, t, n, r) {
	let i = D_(e), a = F_(E_(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(P_)))), a;
}
function L_(e) {
	let t = E_(e);
	return q_[t] + e.slice(t.length);
}
function R_(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function z_(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : R_(e);
}
function B_(e) {
	let { x: t, y: n, width: r, height: i } = e;
	return {
		width: r,
		height: i,
		top: n,
		left: t,
		right: t + r,
		bottom: n + i,
		x: t,
		y: n
	};
}
var V_, H_, U_, W_, G_, K_, q_, J_, Y_, X_, Z_, Q_ = t((() => {
	V_ = [
		"top",
		"right",
		"bottom",
		"left"
	], H_ = Math.min, U_ = Math.max, W_ = Math.round, G_ = Math.floor, K_ = (e) => ({
		x: e,
		y: e
	}), q_ = {
		left: "right",
		right: "left",
		bottom: "top",
		top: "bottom"
	}, J_ = ["left", "right"], Y_ = ["right", "left"], X_ = ["top", "bottom"], Z_ = ["bottom", "top"];
}));
//#endregion
//#region node_modules/.pnpm/@floating-ui+core@1.8.0/node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function $_(e, t, n) {
	let { reference: r, floating: i } = e, a = A_(t), o = j_(t), s = k_(o), c = E_(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
	switch (c) {
		case "top":
			p = {
				x: u,
				y: r.y - i.height
			};
			break;
		case "bottom":
			p = {
				x: u,
				y: r.y + r.height
			};
			break;
		case "right":
			p = {
				x: r.x + r.width,
				y: d
			};
			break;
		case "left":
			p = {
				x: r.x - i.width,
				y: d
			};
			break;
		default: p = {
			x: r.x,
			y: r.y
		};
	}
	let m = D_(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function ev(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = T_(t, e), p = z_(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = B_(await i.getClippingRect({
		element: await (i.isElement == null ? void 0 : i.isElement(m)) ?? !0 ? m : m.contextElement || await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(o.floating)),
		boundary: c,
		rootBoundary: l,
		strategy: s
	})), g = u === "floating" ? {
		x: n,
		y: r,
		width: a.floating.width,
		height: a.floating.height
	} : a.reference, _ = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(o.floating)), v = await (i.isElement == null ? void 0 : i.isElement(_)) && await (i.getScale == null ? void 0 : i.getScale(_)) || {
		x: 1,
		y: 1
	}, y = B_(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
		elements: o,
		rect: g,
		offsetParent: _,
		strategy: s
	}) : g);
	return {
		top: (h.top - y.top + p.top) / v.y,
		bottom: (y.bottom - h.bottom + p.bottom) / v.y,
		left: (h.left - y.left + p.left) / v.x,
		right: (y.right - h.right + p.right) / v.x
	};
}
function tv(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function nv(e) {
	return V_.some((t) => e[t] >= 0);
}
async function rv(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = E_(n), s = D_(n), c = A_(n) === "y", l = lv.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = T_(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
		mainAxis: d,
		crossAxis: 0,
		alignmentAxis: null
	} : {
		mainAxis: d.mainAxis || 0,
		crossAxis: d.crossAxis || 0,
		alignmentAxis: d.alignmentAxis
	};
	return s && typeof m == "number" && (p = s === "end" ? m * -1 : m), c ? {
		x: p * u,
		y: f * l
	} : {
		x: f * l,
		y: p * u
	};
}
var iv, av, ov, sv, cv, lv, uv, dv, fv, pv, mv = t((() => {
	Q_(), iv = 50, av = async (e, t, n) => {
		let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
			...o,
			detectOverflow: ev
		}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}), { x: u, y: d } = $_(l, r, c), f = r, p = 0, m = {};
		for (let n = 0; n < a.length; n++) {
			let h = a[n];
			if (!h) continue;
			let { name: g, fn: _ } = h, { x: v, y, data: b, reset: x } = await _({
				x: u,
				y: d,
				initialPlacement: r,
				placement: f,
				strategy: i,
				middlewareData: m,
				rects: l,
				platform: s,
				elements: {
					reference: e,
					floating: t
				}
			});
			u = v ?? u, d = y ?? d, m[g] = {
				...m[g],
				...b
			}, x && p < iv && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
				reference: e,
				floating: t,
				strategy: i
			}) : x.rects), {x: u, y: d} = $_(l, f, c)), n = -1);
		}
		return {
			x: u,
			y: d,
			placement: f,
			strategy: i,
			middlewareData: m
		};
	}, ov = (e) => ({
		name: "arrow",
		options: e,
		async fn(t) {
			let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = T_(e, t) || {};
			if (l == null) return {};
			let d = z_(u), f = {
				x: n,
				y: r
			}, p = j_(i), m = k_(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
			(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
			let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = H_(d[_], T), D = H_(d[v], T), ee = C - h[m] - D, O = C / 2 - h[m] / 2 + w, te = w_(E, O, ee), ne = !c.arrow && D_(i) != null && O !== te && a.reference[m] / 2 - (O < E ? E : D) - h[m] / 2 < 0, re = ne ? O < E ? O - E : O - ee : 0;
			return {
				[p]: f[p] + re,
				data: {
					[p]: te,
					centerOffset: O - te - re,
					...ne && { alignmentOffset: re }
				},
				reset: ne
			};
		}
	}), sv = function(e) {
		return e === void 0 && (e = {}), {
			name: "flip",
			options: e,
			async fn(t) {
				var n;
				let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = T_(e, t);
				if ((n = i.arrow) != null && n.alignmentOffset) return {};
				let g = E_(r), _ = A_(o), v = E_(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [L_(o)] : N_(o)), x = p !== "none";
				!d && x && b.push(...I_(o, m, p, y));
				let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
				if (l && w.push(C[g]), u) {
					let e = M_(r, a, y);
					w.push(C[e[0]], C[e[1]]);
				}
				if (T = [...T, {
					placement: r,
					overflows: w
				}], !w.every((e) => e <= 0)) {
					let e = (i.flip?.index || 0) + 1, t = S[e];
					if (t && (!(u === "alignment" && _ !== A_(t)) || T.every((e) => A_(e.placement) !== _ || e.overflows[0] > 0))) return {
						data: {
							index: e,
							overflows: T
						},
						reset: { placement: t }
					};
					let n = T.filter((e) => e.overflows[0] <= 0).sort((e, t) => e.overflows[1] - t.overflows[1])[0]?.placement;
					if (!n) switch (f) {
						case "bestFit": {
							let e = T.filter((e) => {
								if (x) {
									let t = A_(e.placement);
									return t === _ || t === "y";
								}
								return !0;
							}).map((e) => [e.placement, e.overflows.filter((e) => e > 0).reduce((e, t) => e + t, 0)]).sort((e, t) => e[1] - t[1])[0]?.[0];
							e && (n = e);
							break;
						}
						case "initialPlacement":
							n = o;
							break;
					}
					if (r !== n) return { reset: { placement: n } };
				}
				return {};
			}
		};
	}, cv = function(e) {
		return e === void 0 && (e = {}), {
			name: "hide",
			options: e,
			async fn(t) {
				let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = T_(e, t);
				switch (i) {
					case "referenceHidden": {
						let e = tv(await r.detectOverflow(t, {
							...a,
							elementContext: "reference"
						}), n.reference);
						return { data: {
							referenceHiddenOffsets: e,
							referenceHidden: nv(e)
						} };
					}
					case "escaped": {
						let e = tv(await r.detectOverflow(t, {
							...a,
							altBoundary: !0
						}), n.floating);
						return { data: {
							escapedOffsets: e,
							escaped: nv(e)
						} };
					}
					default: return {};
				}
			}
		};
	}, lv = /*#__PURE__*/ new Set(["left", "top"]), uv = function(e) {
		return e === void 0 && (e = 0), {
			name: "offset",
			options: e,
			async fn(t) {
				var n;
				let { x: r, y: i, placement: a, middlewareData: o } = t, s = await rv(t, e);
				return a === o.offset?.placement && (n = o.arrow) != null && n.alignmentOffset ? {} : {
					x: r + s.x,
					y: i + s.y,
					data: {
						...s,
						placement: a
					}
				};
			}
		};
	}, dv = function(e) {
		return e === void 0 && (e = {}), {
			name: "shift",
			options: e,
			async fn(t) {
				let { x: n, y: r, placement: i, platform: a } = t, { mainAxis: o = !0, crossAxis: s = !1, limiter: c = { fn: (e) => {
					let { x: t, y: n } = e;
					return {
						x: t,
						y: n
					};
				} }, ...l } = T_(e, t), u = {
					x: n,
					y: r
				}, d = await a.detectOverflow(t, l), f = A_(i), p = O_(f), m = u[p], h = u[f], g = (e, t) => w_(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
				o && (m = g(p, m)), s && (h = g(f, h));
				let _ = c.fn({
					...t,
					[p]: m,
					[f]: h
				});
				return {
					..._,
					data: {
						x: _.x - n,
						y: _.y - r,
						enabled: {
							[p]: o,
							[f]: s
						}
					}
				};
			}
		};
	}, fv = function(e) {
		return e === void 0 && (e = {}), {
			options: e,
			fn(t) {
				let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = T_(e, t), u = {
					x: n,
					y: r
				}, d = A_(i), f = O_(d), p = u[f], m = u[d], h = T_(s, t), g = typeof h == "number" ? {
					mainAxis: h,
					crossAxis: 0
				} : {
					mainAxis: h.mainAxis ?? 0,
					crossAxis: h.crossAxis ?? 0
				};
				if (c) {
					let e = f === "y" ? "height" : "width", t = a.reference[f] - a.floating[e] + g.mainAxis, n = a.reference[f] + a.reference[e] - g.mainAxis;
					p < t ? p = t : p > n && (p = n);
				}
				if (l) {
					let e = f === "y" ? "width" : "height", t = lv.has(E_(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
					m < n ? m = n : m > r && (m = r);
				}
				return {
					[f]: p,
					[d]: m
				};
			}
		};
	}, pv = function(e) {
		return e === void 0 && (e = {}), {
			name: "size",
			options: e,
			async fn(t) {
				let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = T_(e, t), c = await i.detectOverflow(t, s), l = E_(n), u = D_(n), d = A_(n) === "y", { width: f, height: p } = r.floating, m, h;
				l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
				let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = H_(p - c[m], g), y = H_(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
				b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * U_(c.left, c.right) : S = p - 2 * U_(c.top, c.bottom)), await o({
					...t,
					availableWidth: C,
					availableHeight: S
				});
				let w = await i.getDimensions(a.floating);
				return f !== w.width || p !== w.height ? { reset: { rects: !0 } } : {};
			}
		};
	};
}));
//#endregion
//#region node_modules/.pnpm/@floating-ui+utils@0.2.12/node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hv() {
	return typeof window < "u";
}
function gv(e) {
	return yv(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function _v(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function vv(e) {
	return ((yv(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function yv(e) {
	return hv() ? e instanceof Node || e instanceof _v(e).Node : !1;
}
function bv(e) {
	return hv() ? e instanceof Element || e instanceof _v(e).Element : !1;
}
function xv(e) {
	return hv() ? e instanceof HTMLElement || e instanceof _v(e).HTMLElement : !1;
}
function Sv(e) {
	return !hv() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof _v(e).ShadowRoot;
}
function Cv(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Av(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function wv(e) {
	return /^(table|td|th)$/.test(gv(e));
}
function Tv(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
function Ev(e) {
	let t = bv(e) ? Av(e) : e;
	return Rv(t.transform) || Rv(t.translate) || Rv(t.scale) || Rv(t.rotate) || Rv(t.perspective) || !Ov() && (Rv(t.backdropFilter) || Rv(t.filter)) || Iv.test(t.willChange || "") || Lv.test(t.contain || "");
}
function Dv(e) {
	let t = Mv(e);
	for (; xv(t) && !kv(t);) {
		if (Ev(t)) return t;
		if (Tv(t)) return null;
		t = Mv(t);
	}
	return null;
}
function Ov() {
	return zv ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), zv;
}
function kv(e) {
	return /^(html|body|#document)$/.test(gv(e));
}
function Av(e) {
	return _v(e).getComputedStyle(e);
}
function jv(e) {
	return bv(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function Mv(e) {
	if (gv(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Sv(e) && e.host || vv(e);
	return Sv(t) ? t.host : t;
}
function Nv(e) {
	let t = Mv(e);
	return kv(t) ? (e.ownerDocument || e).body : xv(t) && Cv(t) ? t : Nv(t);
}
function Pv(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = Nv(e), i = r === e.ownerDocument?.body, a = _v(r);
	if (i) {
		let e = Fv(a);
		return t.concat(a, a.visualViewport || [], Cv(r) ? r : [], e && n ? Pv(e) : []);
	} else return t.concat(r, Pv(r, [], n));
}
function Fv(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
var Iv, Lv, Rv, zv, Bv = t((() => {
	Iv = /transform|translate|scale|rotate|perspective|filter/, Lv = /paint|layout|strict|content/, Rv = (e) => !!e && e !== "none";
}));
//#endregion
//#region node_modules/.pnpm/@floating-ui+dom@1.8.0/node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function Vv(e) {
	let t = Av(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = xv(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = W_(n) !== a || W_(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function Hv(e) {
	return bv(e) ? e : e.contextElement;
}
function Uv(e) {
	let t = Hv(e);
	if (!xv(t)) return K_(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = Vv(t), o = (a ? W_(n.width) : n.width) / r, s = (a ? W_(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
function Wv(e) {
	let t = _v(e);
	return !Ov() || !t.visualViewport ? fy : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function Gv(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === _v(e);
}
function Kv(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = Hv(e), o = K_(1);
	t && (r ? bv(r) && (o = Uv(r)) : o = Uv(e));
	let s = Gv(a, n, r) ? Wv(a) : K_(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = _v(a), t = bv(r) ? _v(r) : r, n = e, i = Fv(n);
		for (; i && t !== n;) {
			let e = Uv(i), t = i.getBoundingClientRect(), r = Av(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = _v(i), i = Fv(n);
		}
	}
	return B_({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function qv(e, t) {
	let n = jv(e).scrollLeft;
	return t ? t.left + n : Kv(vv(e)).left + n;
}
function Jv(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - qv(e, n),
		y: n.top + t.scrollTop
	};
}
function Yv(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = vv(r), s = t ? Tv(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = K_(1), u = K_(0), d = xv(r);
	if ((d || !a) && ((gv(r) !== "body" || Cv(o)) && (c = jv(r)), d)) {
		let e = Kv(r);
		l = Uv(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? Jv(o, c) : K_(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function Xv(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function Zv(e) {
	let t = jv(e), n = e.ownerDocument.body, r = U_(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = U_(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + qv(e), o = -t.scrollTop;
	return Av(n).direction === "rtl" && (a += U_(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
function Qv(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = _v(e), a = vv(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !Ov() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (qv(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= py && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function $v(e, t) {
	let n = Kv(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Uv(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function ey(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = Qv(e, n, t);
	else if (t === "document") r = Zv(vv(e));
	else if (bv(t)) r = $v(t, n);
	else {
		let n = Wv(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return B_(r);
}
function ty(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = Pv(e, [], !1).filter((e) => bv(e) && gv(e) !== "body"), i = null, a = Av(e).position === "fixed", o = a ? Mv(e) : e;
	for (; bv(o) && !kv(o);) {
		let e = Av(o), t = Ev(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = Mv(o);
	}
	return t.set(e, r), r;
}
function ny(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Tv(t) ? [] : ty(t, this._c) : [].concat(n), r], o = ey(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = ey(t, a[e], i);
		s = U_(n.top, s), c = H_(n.right, c), l = H_(n.bottom, l), u = U_(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function ry(e) {
	let { width: t, height: n } = Vv(e);
	return {
		width: t,
		height: n
	};
}
function iy(e, t, n) {
	let r = xv(t), i = vv(t), a = n === "fixed", o = Kv(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = K_(0);
	if ((r || !a) && ((gv(t) !== "body" || Cv(i)) && (s = jv(t)), r)) {
		let e = Kv(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = qv(i));
	let l = i && !r && !a ? Jv(i, s) : K_(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function ay(e) {
	return Av(e).position === "static";
}
function oy(e, t) {
	if (!xv(e) || Av(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return vv(e) === n && (n = n.ownerDocument.body), n;
}
function sy(e, t) {
	let n = _v(e);
	if (Tv(e)) return n;
	if (!xv(e)) {
		let t = Mv(e);
		for (; t && !kv(t);) {
			if (bv(t) && !ay(t)) return t;
			t = Mv(t);
		}
		return n;
	}
	let r = oy(e, t);
	for (; r && wv(r) && ay(r);) r = oy(r, t);
	return r && kv(r) && ay(r) && !Ev(r) ? n : r || Dv(e) || n;
}
function cy(e) {
	return Av(e).direction === "rtl";
}
function ly(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function uy(e, t, n) {
	let r = null, i, a = vv(e);
	function o() {
		var e;
		clearTimeout(i), (e = r) == null || e.disconnect(), r = null;
	}
	function s(n, c) {
		n === void 0 && (n = !1), c === void 0 && (c = 1), o();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (n || t(), !f || !p) return;
		let m = G_(d), h = G_(a.clientWidth - (u + f)), g = G_(a.clientHeight - (d + p)), _ = G_(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: U_(0, H_(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (!ly(l, e.getBoundingClientRect())) return s();
			if (n !== c) {
				if (!y) return s();
				n ? s(!1, n) : i = setTimeout(() => {
					s(!1, 1e-7);
				}, 1e3);
			}
			y = !1;
		}
		try {
			r = new IntersectionObserver(b, {
				...v,
				root: a.ownerDocument
			});
		} catch {
			r = new IntersectionObserver(b, v);
		}
		r.observe(e);
	}
	let c = _v(e), l = () => s(n);
	return c.addEventListener("resize", l), s(!0), () => {
		c.removeEventListener("resize", l), o();
	};
}
function dy(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = Hv(e), u = i || a ? [...l ? Pv(l) : [], ...t ? Pv(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n), a && e.addEventListener("resize", n);
	});
	let d = l && s ? uy(l, n, a) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? Kv(e) : null;
	c && g();
	function g() {
		let t = Kv(e);
		h && !ly(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var fy, py, my, hy, gy, _y, vy, yy, by, xy, Sy, Cy, wy = t((() => {
	mv(), Q_(), Bv(), fy = /*#__PURE__*/ K_(0), py = 25, my = async function(e) {
		let t = this.getOffsetParent || sy, n = this.getDimensions, r = await n(e.floating);
		return {
			reference: iy(e.reference, await t(e.floating), e.strategy),
			floating: {
				x: 0,
				y: 0,
				width: r.width,
				height: r.height
			}
		};
	}, hy = {
		convertOffsetParentRelativeRectToViewportRelativeRect: Yv,
		getDocumentElement: vv,
		getClippingRect: ny,
		getOffsetParent: sy,
		getElementRects: my,
		getClientRects: Xv,
		getDimensions: ry,
		getScale: Uv,
		isElement: bv,
		isRTL: cy
	}, gy = uv, _y = dv, vy = sv, yy = pv, by = cv, xy = ov, Sy = fv, Cy = (e, t, n) => {
		let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
			...hy,
			...i.platform,
			_c: r
		};
		return av(e, t, {
			...i,
			platform: a
		});
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+popper@1.42.0/node_modules/@zag-js/popper/dist/get-anchor.mjs
function Ty(e = 0, t = 0, n = 0, r = 0) {
	if (typeof DOMRect == "function") return new DOMRect(e, t, n, r);
	let i = {
		x: e,
		y: t,
		width: n,
		height: r,
		top: t,
		right: e + n,
		bottom: t + r,
		left: e
	};
	return {
		...i,
		toJSON: () => i
	};
}
function Ey(e) {
	if (!e) return Ty();
	let { x: t, y: n, width: r, height: i } = e;
	return Ty(t, n, r, i);
}
function Dy(e, t) {
	return {
		contextElement: zc(e) ? e : e?.contextElement,
		getBoundingClientRect: () => {
			let n = e, r = t?.(n);
			return r || !n ? Ey(r) : n.getBoundingClientRect();
		}
	};
}
var Oy = t((() => {
	Y();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+popper@1.42.0/node_modules/@zag-js/popper/dist/middleware.mjs
function ky(e, t) {
	return {
		name: "transformOrigin",
		fn(n) {
			let { elements: r, middlewareData: i, placement: a, rects: o, y: s } = n, c = a.split("-")[0], l = My(c), u = i.arrow?.x || 0, d = i.arrow?.y || 0, f = t?.clientWidth || 0, p = t?.clientHeight || 0, m = u + f / 2, h = d + p / 2, g = Math.abs(i.shift?.y || 0), _ = o.reference.height / 2, v = p / 2, y = e.offset?.mainAxis ?? e.gutter, b = typeof y == "number" ? y + v : y ?? v, x = g > b, S = {
				top: `${m}px calc(100% + ${b}px)`,
				bottom: `${m}px ${-b}px`,
				left: `calc(100% + ${b}px) ${h}px`,
				right: `${-b}px ${h}px`
			}[c], C = `${m}px ${o.reference.y + _ - s}px`, w = !!e.overlap && l === "y" && x;
			return r.floating.style.setProperty(jy.transformOrigin.variable, w ? C : S), { data: { transformOrigin: w ? C : S } };
		}
	};
}
var Ay, jy, My, Ny, Py, Fy = t((() => {
	Ay = (e) => ({
		variable: e,
		reference: `var(${e})`
	}), jy = {
		arrowSize: Ay("--arrow-size"),
		arrowSizeHalf: Ay("--arrow-size-half"),
		arrowBg: Ay("--arrow-background"),
		transformOrigin: Ay("--transform-origin"),
		arrowOffset: Ay("--arrow-offset")
	}, My = (e) => e === "top" || e === "bottom" ? "y" : "x", Ny = {
		name: "rects",
		fn({ rects: e }) {
			return { data: e };
		}
	}, Py = (e) => {
		if (e) return {
			name: "shiftArrow",
			fn({ placement: t, middlewareData: n }) {
				if (!n.arrow) return {};
				let { x: r, y: i } = n.arrow, a = t.split("-")[0];
				return Object.assign(e.style, {
					left: r == null ? "" : `${r}px`,
					top: i == null ? "" : `${i}px`,
					[a]: `calc(100% + ${jy.arrowOffset.reference})`
				}), {};
			}
		};
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+popper@1.42.0/node_modules/@zag-js/popper/dist/placement.mjs
function Iy(e) {
	let [t, n] = e.split("-");
	return {
		side: t,
		align: n,
		hasAlign: n != null
	};
}
function Ly(e) {
	return e.split("-")[0];
}
var Ry = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+popper@1.42.0/node_modules/@zag-js/popper/dist/get-placement.mjs
function zy(e, t) {
	let n = e.devicePixelRatio || 1;
	return Math.round(t * n) / n;
}
function By(e, t) {
	return e != null && Math.abs(e - t) < .5;
}
function Vy(e) {
	return typeof e == "function" ? e() : e === "clipping-ancestors" ? "clippingAncestors" : e;
}
function Hy(e, t, n) {
	return xy({
		element: e || t.createElement("div"),
		padding: n.arrowPadding
	});
}
function Uy(e, t) {
	if (!of(t.offset ?? t.gutter)) return gy(({ placement: n }) => {
		let r = (e?.clientHeight || 0) / 2, i = t.offset?.mainAxis ?? t.gutter, a = typeof i == "number" ? i + r : i ?? r, { hasAlign: o } = Iy(n), s = o ? void 0 : t.shift;
		return Jf({
			crossAxis: t.offset?.crossAxis ?? s,
			mainAxis: a,
			alignmentAxis: t.shift
		});
	});
}
function Wy(e) {
	if (e.flip) return vy(() => {
		let t = Vy(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			padding: e.overflowPadding,
			fallbackPlacements: e.flip === !0 ? void 0 : e.flip
		};
	});
}
function Gy(e) {
	if (!(!e.slide && !e.overlap)) return _y(() => {
		let t = Vy(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			mainAxis: e.slide,
			crossAxis: e.overlap,
			padding: e.overflowPadding,
			limiter: Sy()
		};
	});
}
function Ky(e) {
	if (e.sizeMiddleware === !1 && !e.sameWidth && !e.fitViewport) return;
	let t, n, r, i;
	return yy(() => {
		let a = Vy(e.boundary);
		return {
			padding: e.overflowPadding,
			...a ? { boundary: a } : void 0,
			apply({ elements: e, rects: a, availableHeight: o, availableWidth: s }) {
				let c = e.floating, l = Math.round(a.reference.width), u = Math.round(a.reference.height);
				s = Math.floor(s), o = Math.floor(o), By(t, l) || (c.style.setProperty("--reference-width", `${l}px`), t = l), By(n, u) || (c.style.setProperty("--reference-height", `${u}px`), n = u), By(r, s) || (c.style.setProperty("--available-width", `${s}px`), r = s), By(i, o) || (c.style.setProperty("--available-height", `${o}px`), i = o);
			}
		};
	});
}
function qy(e) {
	if (e.hideWhenDetached) return by(() => ({
		strategy: "referenceHidden",
		boundary: Vy(e.boundary) ?? "clippingAncestors"
	}));
}
function Jy(e) {
	return e ? e === !0 ? {
		ancestorResize: !0,
		ancestorScroll: !0,
		elementResize: !0,
		layoutShift: !0
	} : e : {};
}
function Yy(e, t) {
	if (!e) return Sf;
	let n = new Map(t.map((t) => [t, e.style.getPropertyValue(t)]));
	return () => {
		n.forEach((t, n) => {
			t ? e.style.setProperty(n, t) : e.style.removeProperty(n);
		}), e.style.length === 0 && e.removeAttribute("style");
	};
}
function Xy(e) {
	return e == null ? null : zc(e) ? e : typeof e == "object" && e && "contextElement" in e && e.contextElement ? e.contextElement : e;
}
function Zy(e, t, n = {}) {
	let r = () => (typeof t == "function" ? t() : t) ?? null, i = () => {
		let t = typeof e == "function" ? e() : e;
		return n.getAnchorElement?.() ?? t;
	}, a = () => {
		let e = i();
		return !e && !n.getAnchorRect ? null : Dy(e, n.getAnchorRect);
	}, o = Object.assign({}, $y, n), s = [], c = null, l, u;
	function d(e) {
		l?.(), u?.(), c = e, l = o.restoreStyles ? Yy(e, eb) : void 0;
		let t = e.querySelector("[data-part=arrow]");
		u = o.restoreStyles ? Yy(t, tb) : void 0, s = [
			Uy(t, o),
			Wy(o),
			Gy(o),
			Hy(t, e.ownerDocument, o),
			Py(t),
			ky({
				gutter: o.gutter,
				offset: o.offset,
				overlap: o.overlap
			}, t),
			Ky(o),
			qy(o),
			Ny
		];
	}
	let { placement: f, strategy: p, onComplete: m, onPositioned: h } = o, g, _, v = !1, y, b, x = Sf, S = Jy(o.listeners);
	function C() {
		if (!o.listeners) return;
		let e = i(), t = a(), n = r();
		!t || !n || (Xy(e) !== Xy(y) || n !== b) && (x(), y = e, b = n, x = dy(t, n, T, S));
	}
	async function w() {
		C();
		let e = r();
		if (!e) return;
		e !== c && (d(e), v = !1);
		let t = a();
		if (!t) return;
		let n = await Cy(t, e, {
			placement: f,
			middleware: s,
			strategy: p
		});
		m?.(n);
		let i = Mc(e), l = zy(i, n.x), u = zy(i, n.y);
		if (By(g, l) || (e.style.setProperty("--x", `${l}px`), g = l), By(_, u) || (e.style.setProperty("--y", `${u}px`), _ = u), o.hideWhenDetached && (n.middlewareData.hide?.referenceHidden ? (e.style.setProperty("visibility", "hidden"), e.style.setProperty("pointer-events", "none")) : (e.style.removeProperty("visibility"), e.style.removeProperty("pointer-events"))), !v) {
			let t = e.firstElementChild;
			t && (e.style.setProperty("--z-index", Xc(t).zIndex), v = !0);
		}
	}
	async function T() {
		n.updatePosition ? (await n.updatePosition({
			updatePosition: w,
			floatingElement: r()
		}), h?.({ placed: !0 })) : await w();
	}
	return T(), () => {
		x(), u?.(), l?.(), h?.({ placed: !1 });
	};
}
function Qy(e, t, n = {}) {
	let { defer: r, ...i } = n, a = r ? J : (e) => e(), o = [];
	return o.push(a(() => {
		o.push(Zy(e, t, i));
	})), () => {
		o.forEach((e) => e?.());
	};
}
var $y, eb, tb, nb = t((() => {
	wy(), Y(), X(), Oy(), Fy(), Ry(), $y = {
		strategy: "absolute",
		placement: "bottom",
		listeners: !0,
		restoreStyles: !1,
		gutter: 8,
		flip: !0,
		slide: !0,
		overlap: !1,
		sameWidth: !1,
		fitViewport: !1,
		overflowPadding: 8,
		arrowPadding: 4
	}, eb = [
		"transform",
		"visibility",
		"pointer-events",
		"--x",
		"--y",
		"--z-index",
		"--reference-width",
		"--reference-height",
		"--available-width",
		"--available-height",
		"--transform-origin"
	], tb = [
		"top",
		"right",
		"bottom",
		"left"
	];
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+popper@1.42.0/node_modules/@zag-js/popper/dist/get-styles.mjs
function rb(e = {}) {
	let { placement: t, sameWidth: n, fitViewport: r, strategy: i = "absolute" } = e;
	return {
		arrow: {
			position: "absolute",
			width: jy.arrowSize.reference,
			height: jy.arrowSize.reference,
			[jy.arrowSizeHalf.variable]: `calc(${jy.arrowSize.reference} / 2)`,
			[jy.arrowOffset.variable]: `calc(${jy.arrowSizeHalf.reference} * -1)`
		},
		arrowTip: {
			transform: t ? ib[t.split("-")[0]] : void 0,
			background: jy.arrowBg.reference,
			top: "0",
			left: "0",
			width: "100%",
			height: "100%",
			position: "absolute",
			zIndex: "inherit"
		},
		floating: {
			position: i,
			isolation: "isolate",
			minWidth: n ? void 0 : "max-content",
			width: n ? "var(--reference-width)" : void 0,
			maxWidth: r ? "var(--available-width)" : void 0,
			maxHeight: r ? "var(--available-height)" : void 0,
			pointerEvents: t ? void 0 : "none",
			top: "0px",
			left: "0px",
			transform: t ? "translate3d(var(--x), var(--y), 0)" : "translate3d(0, -100vh, 0)",
			zIndex: "var(--z-index)"
		}
	};
}
var ib, ab = t((() => {
	Fy(), ib = {
		bottom: "rotate(45deg)",
		left: "rotate(135deg)",
		top: "rotate(225deg)",
		right: "rotate(315deg)"
	};
})), ob = t((() => {
	nb(), ab(), Ry();
})), sb, cb, lb, ub, db, fb, pb, mb, hb, gb, _b, vb, yb, bb, xb, Sb, Cb, wb = t((() => {
	sb = (e) => e.ids?.root ?? `select:${e.id}`, cb = (e) => e.ids?.content ?? `select:${e.id}:content`, lb = (e) => e.ids?.trigger ?? `select:${e.id}:trigger`, ub = (e) => e.ids?.clearTrigger ?? `select:${e.id}:clear-trigger`, db = (e) => e.ids?.label ?? `select:${e.id}:label`, fb = (e) => e.ids?.control ?? `select:${e.id}:control`, pb = (e, t) => e.ids?.item?.(t) ?? `select:${e.id}:option:${t}`, mb = (e) => e.ids?.hiddenSelect ?? `select:${e.id}:select`, hb = (e) => e.ids?.positioner ?? `select:${e.id}:positioner`, gb = (e, t) => e.ids?.itemGroup?.(t) ?? `select:${e.id}:optgroup:${t}`, _b = (e, t) => e.ids?.itemGroupLabel?.(t) ?? `select:${e.id}:optgroup-label:${t}`, vb = (e) => e.getById(mb(e)), yb = (e) => e.getById(cb(e)), bb = (e) => e.getById(lb(e)), xb = (e) => e.getById(ub(e)), Sb = (e) => e.getById(hb(e)), Cb = (e, t) => t == null ? null : e.getById(pb(e, t));
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+select@1.42.0/node_modules/@zag-js/select/dist/select.connect.mjs
function Tb(e, t) {
	let { context: n, prop: r, scope: i, state: a, computed: o, send: s } = e, c = r("translations"), l = r("disabled") || n.get("fieldsetDisabled"), u = !!r("invalid"), d = !!r("required"), f = !!r("readOnly"), p = r("composite"), m = r("collection"), h = a.hasTag("open"), g = a.matches("focused"), _ = n.get("highlightedValue"), v = n.get("highlightedItem"), y = o("selectedItems"), b = n.get("currentPlacement"), x = b ? Ly(b) : void 0, S = o("isTypingAhead"), C = o("isInteractive"), w = _ ? pb(i, _) : void 0;
	function T(e) {
		let t = m.getItemDisabled(e.item), r = m.getItemValue(e.item);
		return tp(r, () => `[zag-js] No value found for item ${JSON.stringify(e.item)}`), {
			value: r,
			disabled: !!(l || t),
			highlighted: _ === r,
			selected: n.get("value").includes(r)
		};
	}
	let E = rb({
		...r("positioning"),
		placement: b
	});
	return {
		open: h,
		focused: g,
		empty: n.get("value").length === 0,
		highlightedItem: v,
		highlightedValue: _,
		selectedItems: y,
		hasSelectedItems: o("hasSelectedItems"),
		value: n.get("value"),
		valueAsString: o("valueAsString"),
		collection: m,
		multiple: !!r("multiple"),
		disabled: !!l,
		reposition(e = {}) {
			s({
				type: "POSITIONING.SET",
				options: e
			});
		},
		focus() {
			bb(i)?.focus({ preventScroll: !0 });
		},
		setOpen(e) {
			a.hasTag("open") !== e && s({ type: e ? "OPEN" : "CLOSE" });
		},
		selectValue(e) {
			s({
				type: "ITEM.SELECT",
				value: e
			});
		},
		setValue(e) {
			s({
				type: "VALUE.SET",
				value: e
			});
		},
		selectAll() {
			s({
				type: "VALUE.SET",
				value: m.getValues()
			});
		},
		setHighlightValue(e) {
			s({
				type: "HIGHLIGHTED_VALUE.SET",
				value: e
			});
		},
		clearHighlightValue() {
			s({ type: "HIGHLIGHTED_VALUE.CLEAR" });
		},
		clearValue(e) {
			s(e ? {
				type: "ITEM.CLEAR",
				value: e
			} : { type: "VALUE.CLEAR" });
		},
		getItemState: T,
		getRootProps() {
			return t.element({
				...kg.root.attrs,
				dir: r("dir"),
				id: sb(i),
				"data-invalid": K(u),
				"data-readonly": K(f)
			});
		},
		getLabelProps() {
			return t.label({
				dir: r("dir"),
				id: db(i),
				...kg.label.attrs,
				"data-disabled": K(l),
				"data-invalid": K(u),
				"data-readonly": K(f),
				"data-required": K(d),
				htmlFor: mb(i),
				onClick(e) {
					e.defaultPrevented || l || bb(i)?.focus({ preventScroll: !0 });
				}
			});
		},
		getControlProps() {
			return t.element({
				...kg.control.attrs,
				dir: r("dir"),
				id: fb(i),
				"data-state": h ? "open" : "closed",
				"data-focus": K(g),
				"data-disabled": K(l),
				"data-invalid": K(u)
			});
		},
		getValueTextProps() {
			return t.element({
				...kg.valueText.attrs,
				dir: r("dir"),
				"data-disabled": K(l),
				"data-invalid": K(u),
				"data-focus": K(g)
			});
		},
		getTriggerProps() {
			return t.button({
				id: lb(i),
				disabled: l,
				dir: r("dir"),
				type: "button",
				role: "combobox",
				"aria-controls": cb(i),
				"aria-expanded": h,
				"aria-haspopup": "listbox",
				"data-state": h ? "open" : "closed",
				"aria-invalid": u,
				"aria-required": d,
				"aria-labelledby": db(i),
				...kg.trigger.attrs,
				"data-disabled": K(l),
				"data-invalid": K(u),
				"data-readonly": K(f),
				"data-placement": b,
				"data-side": x,
				"data-placeholder-shown": K(!o("hasSelectedItems")),
				onClick(e) {
					C && (e.defaultPrevented || s({ type: "TRIGGER.CLICK" }));
				},
				onFocus() {
					s({ type: "TRIGGER.FOCUS" });
				},
				onBlur() {
					s({ type: "TRIGGER.BLUR" });
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !C) return;
					let t = {
						ArrowUp() {
							s({ type: "TRIGGER.ARROW_UP" });
						},
						ArrowDown(e) {
							s({ type: e.altKey ? "OPEN" : "TRIGGER.ARROW_DOWN" });
						},
						ArrowLeft() {
							s({ type: "TRIGGER.ARROW_LEFT" });
						},
						ArrowRight() {
							s({ type: "TRIGGER.ARROW_RIGHT" });
						},
						Home() {
							s({ type: "TRIGGER.HOME" });
						},
						End() {
							s({ type: "TRIGGER.END" });
						},
						Enter() {
							s({ type: "TRIGGER.ENTER" });
						},
						Space(e) {
							s(S ? {
								type: "TRIGGER.TYPEAHEAD",
								key: e.key
							} : { type: "TRIGGER.ENTER" });
						}
					}[kl(e, {
						dir: r("dir"),
						orientation: "vertical"
					})];
					if (t) {
						t(e), e.preventDefault();
						return;
					}
					wd.isValidEvent(e) && (s({
						type: "TRIGGER.TYPEAHEAD",
						key: e.key
					}), e.preventDefault());
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...kg.indicator.attrs,
				dir: r("dir"),
				"aria-hidden": !0,
				"data-state": h ? "open" : "closed",
				"data-disabled": K(l),
				"data-invalid": K(u),
				"data-readonly": K(f)
			});
		},
		getItemProps(n) {
			let a = T(n);
			return t.element({
				id: pb(i, a.value),
				role: "option",
				...kg.item.attrs,
				dir: r("dir"),
				"data-value": a.value,
				"aria-selected": a.selected,
				"data-state": a.selected ? "checked" : "unchecked",
				"data-highlighted": K(a.highlighted),
				"data-disabled": K(a.disabled),
				"aria-disabled": wc(a.disabled),
				onPointerMove(e) {
					a.disabled || e.pointerType !== "mouse" || a.value !== _ && s({
						type: "ITEM.POINTER_MOVE",
						value: a.value
					});
				},
				onClick(e) {
					e.defaultPrevented || a.disabled || s({
						type: "ITEM.CLICK",
						src: "pointerup",
						value: a.value
					});
				},
				onPointerLeave(t) {
					a.disabled || n.persistFocus || t.pointerType === "mouse" && e.event.previous()?.type.includes("POINTER") && s({ type: "ITEM.POINTER_LEAVE" });
				}
			});
		},
		getItemTextProps(e) {
			let n = T(e);
			return t.element({
				...kg.itemText.attrs,
				"data-state": n.selected ? "checked" : "unchecked",
				"data-disabled": K(n.disabled),
				"data-highlighted": K(n.highlighted)
			});
		},
		getItemIndicatorProps(e) {
			let n = T(e);
			return t.element({
				"aria-hidden": !0,
				...kg.itemIndicator.attrs,
				"data-state": n.selected ? "checked" : "unchecked",
				hidden: !n.selected
			});
		},
		getItemGroupLabelProps(e) {
			let { htmlFor: n } = e;
			return t.element({
				...kg.itemGroupLabel.attrs,
				id: _b(i, n),
				dir: r("dir"),
				role: "presentation"
			});
		},
		getItemGroupProps(e) {
			let { id: n } = e;
			return t.element({
				...kg.itemGroup.attrs,
				"data-disabled": K(l),
				id: gb(i, n),
				"aria-labelledby": _b(i, n),
				role: "group",
				dir: r("dir")
			});
		},
		getClearTriggerProps() {
			return t.button({
				...kg.clearTrigger.attrs,
				id: ub(i),
				type: "button",
				"aria-label": c.clearTriggerLabel,
				"data-invalid": K(u),
				disabled: l,
				hidden: !o("hasSelectedItems"),
				dir: r("dir"),
				onClick(e) {
					e.defaultPrevented || s({ type: "CLEAR.CLICK" });
				}
			});
		},
		getHiddenSelectProps() {
			let e = n.get("value"), a = r("multiple") ? e : e?.[0], o = (e) => {
				Zl(Al(e)) || s({
					type: "VALUE.SET",
					value: Eb(e.currentTarget)
				});
			};
			return t.select({
				name: r("name"),
				form: r("form"),
				disabled: l,
				multiple: r("multiple"),
				required: r("required"),
				"aria-hidden": !0,
				id: mb(i),
				defaultValue: a,
				style: Dd,
				tabIndex: -1,
				autoComplete: r("autoComplete"),
				onChange: o,
				onInput: o,
				onFocus() {
					bb(i)?.focus({ preventScroll: !0 });
				},
				"aria-labelledby": db(i)
			});
		},
		getPositionerProps() {
			return t.element({
				...kg.positioner.attrs,
				dir: r("dir"),
				id: hb(i),
				style: E.floating
			});
		},
		getContentProps() {
			return t.element({
				hidden: !h,
				dir: r("dir"),
				id: cb(i),
				role: p ? "listbox" : "dialog",
				...kg.content.attrs,
				"data-state": h ? "open" : "closed",
				"data-placement": b,
				"data-side": x,
				"data-activedescendant": w,
				"aria-activedescendant": p ? w : void 0,
				"aria-multiselectable": r("multiple") && p ? !0 : void 0,
				"aria-labelledby": db(i),
				tabIndex: 0,
				onKeyDown(e) {
					if (!C || !kc(e.currentTarget, Sl(e))) return;
					if (e.key === "Tab" && !gu(e)) {
						e.preventDefault();
						return;
					}
					let t = {
						ArrowUp() {
							s({ type: "CONTENT.ARROW_UP" });
						},
						ArrowDown() {
							s({ type: "CONTENT.ARROW_DOWN" });
						},
						Home() {
							s({ type: "CONTENT.HOME" });
						},
						End() {
							s({ type: "CONTENT.END" });
						},
						Enter() {
							s({
								type: "ITEM.CLICK",
								src: "keydown.enter"
							});
						},
						Space(e) {
							S ? s({
								type: "CONTENT.TYPEAHEAD",
								key: e.key
							}) : t.Enter?.(e);
						}
					}, n = t[kl(e)];
					if (n) {
						n(e), e.preventDefault();
						return;
					}
					Oc(Sl(e)) || wd.isValidEvent(e) && (s({
						type: "CONTENT.TYPEAHEAD",
						key: e.key
					}), e.preventDefault());
				}
			});
		},
		getListProps() {
			return t.element({
				...kg.list.attrs,
				tabIndex: 0,
				role: p ? void 0 : "listbox",
				"aria-labelledby": lb(i),
				"aria-activedescendant": p ? void 0 : w,
				"aria-multiselectable": !p && r("multiple") ? !0 : void 0
			});
		}
	};
}
var Eb, Db = t((() => {
	Y(), ob(), X(), Ag(), wb(), Eb = (e) => e.multiple ? Array.from(e.selectedOptions, (e) => e.value) : e.value ? [e.value] : [];
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+interact-outside@1.42.0/node_modules/@zag-js/interact-outside/dist/frame-utils.mjs
function Ob(e) {
	let t = {
		each(t) {
			for (let n = 0; n < e.frames?.length; n += 1) {
				let r = e.frames[n];
				r && t(r);
			}
		},
		addEventListener(e, n, r) {
			return t.each((t) => {
				try {
					t.document.addEventListener(e, n, r);
				} catch {}
			}), () => {
				try {
					t.removeEventListener(e, n, r);
				} catch {}
			};
		},
		removeEventListener(e, n, r) {
			t.each((t) => {
				try {
					t.document.removeEventListener(e, n, r);
				} catch {}
			});
		}
	};
	return t;
}
function kb(e) {
	let t = e.frameElement == null ? null : e.parent;
	return {
		addEventListener: (e, n, r) => {
			try {
				t?.addEventListener(e, n, r);
			} catch {}
			return () => {
				try {
					t?.removeEventListener(e, n, r);
				} catch {}
			};
		},
		removeEventListener: (e, n, r) => {
			try {
				t?.removeEventListener(e, n, r);
			} catch {}
		}
	};
}
var Ab = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+interact-outside@1.42.0/node_modules/@zag-js/interact-outside/dist/index.mjs
function jb(e) {
	for (let t of e) if (zc(t) && ou(t)) return !0;
	return !1;
}
function Mb(e, t) {
	if (!Bb(t) || !e) return !1;
	let n = e.getBoundingClientRect();
	return n.width === 0 || n.height === 0 ? !1 : n.top <= t.clientY && t.clientY <= n.top + n.height && n.left <= t.clientX && t.clientX <= n.left + n.width;
}
function Nb(e, t) {
	return e.y <= t.y && t.y <= e.y + e.height && e.x <= t.x && t.x <= e.x + e.width;
}
function Pb(e, t) {
	if (!t || !Bb(e)) return !1;
	let n = t.scrollHeight > t.clientHeight, r = n && e.clientX > t.offsetLeft + t.clientWidth, i = t.scrollWidth > t.clientWidth, a = i && e.clientY > t.offsetTop + t.clientHeight;
	return Nb({
		x: t.offsetLeft,
		y: t.offsetTop,
		width: t.clientWidth + (n ? 16 : 0),
		height: t.clientHeight + (i ? 16 : 0)
	}, {
		x: e.clientX,
		y: e.clientY
	}) ? r || a : !1;
}
function Fb(e, t) {
	let { exclude: n, onFocusOutside: r, onPointerDownOutside: i, onInteractOutside: a, defer: o, followControlledElements: s = !0 } = t;
	if (!e) return;
	let c = Ac(e), l = Mc(e), u = Ob(l), d = kb(l);
	function f(t, r) {
		if (!zc(r) || !r.isConnected || kc(e, r) || Mb(e, t) || s && $c(e, r)) return !1;
		let i = c.querySelector(`[aria-controls="${e.id}"]`);
		return i && Pb(t, ku(i)) || Pb(t, ku(e)) ? !1 : !n?.(r);
	}
	let p = /* @__PURE__ */ new Set(), m = Wc(e?.getRootNode()), h = !1;
	function g(t) {
		h = !0;
		let n = () => {
			h = !1;
		};
		c.addEventListener("pointerup", n, { once: !0 }), l.addEventListener("pointerup", n, { once: !0 });
		function r(n) {
			let r = o && !dl() ? J : (e) => e(), s = n ?? t, c = s?.composedPath?.() ?? [s?.target];
			r(() => {
				let n = m ? c[0] : Sl(t);
				if (!(!e || !f(t, n))) {
					if (i || a) {
						let t = Cf(i, a);
						e.addEventListener(Rb, t, { once: !0 });
					}
					Lb(e, Rb, {
						bubbles: !1,
						cancelable: !0,
						detail: {
							originalEvent: s,
							contextmenu: Pl(s),
							focusable: jb(c),
							target: n
						}
					});
				}
			});
		}
		t.pointerType === "touch" ? (p.forEach((e) => e()), p.add(q(c, "click", r, { once: !0 })), p.add(d.addEventListener("click", r, { once: !0 })), p.add(u.addEventListener("click", r, { once: !0 }))) : r();
	}
	let _ = /* @__PURE__ */ new Set(), v = setTimeout(() => {
		_.add(q(c, "pointerdown", g, !0)), _.add(d.addEventListener("pointerdown", g, !0)), _.add(u.addEventListener("pointerdown", g, !0));
	}, 0);
	function y(t) {
		h || (o ? J : (e) => e())(() => {
			let n = t?.composedPath?.() ?? [t?.target], i = m ? n[0] : Sl(t);
			if (!(!e || !f(t, i))) {
				if (r || a) {
					let t = Cf(r, a);
					e.addEventListener(zb, t, { once: !0 });
				}
				Lb(e, zb, {
					bubbles: !1,
					cancelable: !0,
					detail: {
						originalEvent: t,
						contextmenu: !1,
						focusable: ou(i),
						target: i
					}
				});
			}
		});
	}
	return dl() || (_.add(q(c, "focusin", y, !0)), _.add(d.addEventListener("focusin", y, !0)), _.add(u.addEventListener("focusin", y, !0))), () => {
		clearTimeout(v), p.forEach((e) => e()), _.forEach((e) => e());
	};
}
function Ib(e, t) {
	let { defer: n } = t, r = n ? J : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(Fb(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
function Lb(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, n);
	return e.dispatchEvent(r);
}
var Rb, zb, Bb, Vb = t((() => {
	Y(), X(), Ab(), Rb = "pointerdown.outside", zb = "focus.outside", Bb = (e) => "clientY" in e;
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dismissable@1.42.0/node_modules/@zag-js/dismissable/dist/escape-keydown.mjs
function Hb(e, t) {
	return q(Ac(e), "keydown", (e) => {
		e.key === "Escape" && (e.isComposing || t?.(e));
	}, { capture: !0 });
}
var Ub = t((() => {
	Y();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dismissable@1.42.0/node_modules/@zag-js/dismissable/dist/layer-stack.mjs
function Wb(e, t, n) {
	n.style.setProperty("--layer-index", `${t}`), n.removeAttribute("data-nested"), n.removeAttribute("data-has-nested"), Yb.getParentLayerOfType(e.node, e.type) && n.setAttribute("data-nested", e.type);
	let r = Yb.countNestedLayersOfType(e.node, e.type);
	r > 0 && n.setAttribute("data-has-nested", e.type), n.style.setProperty("--nested-layer-count", `${r}`);
}
function Gb(e) {
	e.style.removeProperty("--layer-index"), e.style.removeProperty("--nested-layer-count"), e.style.removeProperty("--z-index"), e.removeAttribute("data-nested"), e.removeAttribute("data-has-nested");
}
function Kb(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, {
		cancelable: !0,
		bubbles: !0,
		detail: n
	});
	return e.dispatchEvent(r);
}
function qb(e, t, n) {
	e.addEventListener(t, n, { once: !0 });
}
var Jb, Yb, Xb = t((() => {
	Y(), Jb = "layer:request-dismiss", Yb = {
		layers: [],
		branches: [],
		recentlyRemoved: /* @__PURE__ */ new Set(),
		count() {
			return this.layers.length;
		},
		pointerBlockingLayers() {
			return this.layers.filter((e) => e.pointerBlocking);
		},
		topMostPointerBlockingLayer() {
			return [...this.pointerBlockingLayers()].slice(-1)[0];
		},
		hasPointerBlockingLayer() {
			return this.pointerBlockingLayers().length > 0;
		},
		isBelowPointerBlockingLayer(e) {
			return this.indexOf(e) < (this.topMostPointerBlockingLayer() ? this.indexOf(this.topMostPointerBlockingLayer()?.node) : -1);
		},
		isTopMost(e) {
			return this.layers[this.count() - 1]?.node === e;
		},
		getNestedLayers(e) {
			return Array.from(this.layers).slice(this.indexOf(e) + 1);
		},
		getLayersByType(e) {
			return this.layers.filter((t) => t.type === e);
		},
		getNestedLayersByType(e, t) {
			let n = this.indexOf(e);
			return n === -1 ? [] : this.layers.slice(n + 1).filter((e) => e.type === t);
		},
		getParentLayerOfType(e, t) {
			let n = this.indexOf(e);
			if (!(n <= 0)) return this.layers.slice(0, n).reverse().find((e) => e.type === t);
		},
		countNestedLayersOfType(e, t) {
			return this.getNestedLayersByType(e, t).length;
		},
		isInNestedLayer(e, t) {
			return !!(this.getNestedLayers(e).some((e) => kc(e.node, t)) || this.recentlyRemoved.size > 0);
		},
		isInBranch(e) {
			return Array.from(this.branches).some((t) => kc(t, e));
		},
		add(e) {
			let t = this.indexOf(e.node);
			t !== -1 && this.layers.splice(t, 1), this.layers.push(e), this.syncLayers();
		},
		addBranch(e) {
			this.branches.push(e);
		},
		remove(e) {
			let t = this.indexOf(e);
			t < 0 || (this.layers[t].styleTargets?.forEach((e) => {
				let t = e();
				t && Gb(t);
			}), this.recentlyRemoved.add(e), vu(() => this.recentlyRemoved.delete(e)), t < this.count() - 1 && this.getNestedLayers(e).forEach((t) => Yb.dismiss(t.node, e)), this.layers.splice(t, 1), this.syncLayers());
		},
		removeBranch(e) {
			let t = this.branches.indexOf(e);
			t >= 0 && this.branches.splice(t, 1);
		},
		syncLayers() {
			this.layers.forEach((e, t) => {
				Wb(e, t, e.node), e.styleTargets?.forEach((n) => {
					let r = n();
					if (!r || r === e.node) return;
					Wb(e, t, r);
					let { zIndex: i } = Xc(e.node);
					r.style.setProperty("--z-index", i);
				});
			});
		},
		indexOf(e) {
			return this.layers.findIndex((t) => t.node === e);
		},
		dismiss(e, t) {
			let n = this.indexOf(e);
			if (n === -1) return;
			let r = this.layers[n];
			qb(e, Jb, (e) => {
				r.requestDismiss?.(e), e.defaultPrevented || r?.dismiss();
			}), Kb(e, Jb, {
				originalLayer: e,
				targetLayer: t,
				originalIndex: n,
				targetIndex: t ? this.indexOf(t) : -1
			}), this.syncLayers();
		},
		clear() {
			this.remove(this.layers[0].node);
		}
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dismissable@1.42.0/node_modules/@zag-js/dismissable/dist/pointer-event-outside.mjs
function Zb(e) {
	return Yb.isBelowPointerBlockingLayer(e) ? "none" : "auto";
}
function Qb(e) {
	let t = Zb(e);
	e.style.pointerEvents !== t && (e.style.pointerEvents = t);
}
function $b(e) {
	if (ix.has(e)) return;
	let t = Mc(e);
	if (t.MutationObserver === void 0) return;
	let n = new t.MutationObserver(() => {
		ix.has(e) && Qb(e);
	});
	n.observe(e, {
		attributes: !0,
		attributeFilter: ["style"]
	}), ix.set(e, n);
}
function ex() {
	Yb.layers.forEach(({ node: e }) => {
		Qb(e), $b(e);
	});
}
function tx(e) {
	let t = ix.get(e);
	t && (t.disconnect(), ix.delete(e)), e.style.pointerEvents = "";
}
function nx(e, t) {
	let n = Ac(e), r = [];
	return Yb.hasPointerBlockingLayer() && !n.body.hasAttribute("data-inert") && (rx.set(n.body, n.body.style.pointerEvents), queueMicrotask(() => {
		let e = n.body;
		e && (e.style.pointerEvents = "none", e.setAttribute("data-inert", ""));
	})), t?.forEach((e) => {
		let [t, n] = Ad(() => {
			let t = e();
			return zc(t) ? t : null;
		}, { timeout: 1e3 });
		t.then((e) => r.push(yd(e, { pointerEvents: "auto" }))), r.push(n);
	}), () => {
		Yb.hasPointerBlockingLayer() || (queueMicrotask(() => {
			let e = n.body;
			if (!e) return;
			let t = rx.get(e);
			t !== void 0 && (e.style.pointerEvents = t, rx.delete(e)), e.removeAttribute("data-inert"), e.style.length === 0 && e.removeAttribute("style");
		}), r.forEach((e) => e()));
	};
}
var rx, ix, ax = t((() => {
	Y(), Xb(), rx = /* @__PURE__ */ new WeakMap(), ix = /* @__PURE__ */ new WeakMap();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+dismissable@1.42.0/node_modules/@zag-js/dismissable/dist/dismissable-layer.mjs
function ox(e, t) {
	let { warnOnMissingNode: n = !0 } = t;
	if (n && !e) {
		$f("[@zag-js/dismissable] node is `null` or `undefined`");
		return;
	}
	if (!e) return;
	let { onDismiss: r, onRequestDismiss: i, pointerBlocking: a, exclude: o, debug: s, type: c = "dialog", layerStyleTargets: l } = t, u = {
		dismiss: r,
		node: e,
		type: c,
		pointerBlocking: a,
		requestDismiss: i,
		styleTargets: l
	};
	Yb.add(u), ex();
	function d(n) {
		let i = Sl(n.detail.originalEvent);
		Yb.isBelowPointerBlockingLayer(e) || Yb.isInBranch(i) || (t.onPointerDownOutside?.(n), t.onInteractOutside?.(n), !n.defaultPrevented && (s && console.log("onPointerDownOutside:", n.detail.originalEvent), r?.()));
	}
	function f(e) {
		let n = Sl(e.detail.originalEvent);
		Yb.isInBranch(n) || (t.onFocusOutside?.(e), t.onInteractOutside?.(e), !e.defaultPrevented && (s && console.log("onFocusOutside:", e.detail.originalEvent), r?.()));
	}
	function p(n) {
		Yb.isTopMost(e) && (t.onEscapeKeyDown?.(n), !n.defaultPrevented && r && (n.preventDefault(), r()));
	}
	function m(n) {
		if (!e) return !1;
		let r = typeof o == "function" ? o() : o, i = Array.isArray(r) ? r : [r], a = t.persistentElements?.map((e) => e()).filter(zc);
		return a && i.push(...a), i.some((e) => kc(e, n)) || Yb.isInNestedLayer(e, n);
	}
	let h = [
		a ? nx(e, t.persistentElements) : void 0,
		Hb(e, p),
		Ib(e, {
			exclude: m,
			onFocusOutside: f,
			onPointerDownOutside: d,
			defer: t.defer
		})
	];
	return () => {
		Yb.remove(e), ex(), tx(e), h.forEach((e) => e?.());
	};
}
function sx(e, t) {
	let { defer: n } = t, r = n ? J : (e) => e(), i = [];
	return i.push(r(() => {
		let n = af(e) ? e() : e;
		i.push(ox(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
var cx = t((() => {
	Y(), Vb(), X(), Ub(), Xb(), ax();
})), lx = t((() => {
	cx();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+select@1.42.0/node_modules/@zag-js/select/dist/select.machine.mjs
function ux(e) {
	let t = e.restoreFocus ?? e.previousEvent?.restoreFocus;
	return t == null || !!t;
}
var dx, fx, px, mx, hx = t((() => {
	um(), lx(), Y(), Rh(), ob(), X(), x_(), C_(), wb(), {and: dx, not: fx, or: px} = tm(), mx = nm({
		props({ props: e }) {
			return {
				loopFocus: !1,
				closeOnSelect: !e.multiple,
				composite: !0,
				defaultValue: [],
				...e,
				collection: e.collection ?? S_.empty(),
				translations: {
					clearTriggerLabel: "Clear value",
					...e.translations
				},
				positioning: {
					placement: "bottom-start",
					gutter: 8,
					...e.positioning
				}
			};
		},
		context({ prop: e, bindable: t, getContext: n }) {
			let r = e("value") ?? e("defaultValue") ?? [], i = e("collection").findMany(r);
			return {
				value: t(() => ({
					defaultValue: e("defaultValue"),
					value: e("value"),
					isEqual: Zd,
					onChange(t) {
						let r = n(), i = e("collection"), a = Hg({
							values: t,
							collection: i,
							selectedItemMap: r.get("selectedItemMap")
						}), o = e("value") ?? t, s = o === t ? a : Hg({
							values: o,
							collection: i,
							selectedItemMap: a.nextSelectedItemMap
						});
						return r.set("selectedItemMap", s.nextSelectedItemMap), e("onValueChange")?.({
							value: t,
							items: a.selectedItems
						});
					}
				})),
				highlightedValue: t(() => ({
					defaultValue: e("defaultHighlightedValue") || null,
					value: e("highlightedValue"),
					onChange(t) {
						e("onHighlightChange")?.({
							highlightedValue: t,
							highlightedItem: e("collection").find(t),
							highlightedIndex: e("collection").indexOf(t)
						});
					}
				})),
				currentPlacement: t(() => ({ defaultValue: void 0 })),
				fieldsetDisabled: t(() => ({ defaultValue: !1 })),
				highlightedItem: t(() => ({ defaultValue: null })),
				selectedItemMap: t(() => ({ defaultValue: Ug({
					selectedItems: i,
					collection: e("collection")
				}) }))
			};
		},
		refs() {
			return { typeahead: { ...wd.defaultOptions } };
		},
		computed: {
			hasSelectedItems: ({ context: e }) => e.get("value").length > 0,
			isTypingAhead: ({ refs: e }) => e.get("typeahead").keysSoFar !== "",
			isDisabled: ({ prop: e, context: t }) => !!e("disabled") || !!t.get("fieldsetDisabled"),
			isInteractive: ({ prop: e }) => !(e("disabled") || e("readOnly")),
			selectedItems: ({ context: e, prop: t }) => Bg({
				values: e.get("value"),
				collection: t("collection"),
				selectedItemMap: e.get("selectedItemMap")
			}),
			valueAsString: ({ computed: e, prop: t }) => t("collection").stringifyItems(e("selectedItems"))
		},
		initialState({ prop: e }) {
			return e("open") || e("defaultOpen") ? "open" : "idle";
		},
		entry: ["syncSelectElement"],
		watch({ context: e, prop: t, track: n, action: r }) {
			n([() => e.get("value").toString()], () => {
				r([
					"syncSelectedItems",
					"syncSelectElement",
					"dispatchChangeEvent"
				]);
			}), n([() => t("open")], () => {
				r(["toggleVisibility"]);
			}), n([() => e.get("highlightedValue")], () => {
				r(["syncHighlightedItem"]);
			}), n([() => t("collection").toString()], () => {
				r(["syncCollection"]);
			});
		},
		on: {
			"HIGHLIGHTED_VALUE.SET": { actions: ["setHighlightedItem"] },
			"HIGHLIGHTED_VALUE.CLEAR": { actions: ["clearHighlightedItem"] },
			"ITEM.SELECT": { actions: ["selectItem"] },
			"ITEM.CLEAR": { actions: ["clearItem"] },
			"VALUE.SET": { actions: ["setSelectedItems"] },
			"VALUE.CLEAR": { actions: ["clearSelectedItems"] },
			"CLEAR.CLICK": { actions: ["clearSelectedItems", "focusTriggerEl"] }
		},
		effects: ["trackFormControlState"],
		states: {
			idle: {
				tags: ["closed"],
				on: {
					"CONTROLLED.OPEN": [{
						guard: "isTriggerClickEvent",
						target: "open",
						actions: ["setInitialFocus", "highlightFirstSelectedItem"]
					}, {
						target: "open",
						actions: ["setInitialFocus"]
					}],
					"TRIGGER.CLICK": [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"invokeOnOpen",
							"setInitialFocus",
							"highlightFirstSelectedItem"
						]
					}],
					"TRIGGER.FOCUS": { target: "focused" },
					OPEN: [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: ["setInitialFocus", "invokeOnOpen"]
					}]
				}
			},
			focused: {
				tags: ["closed"],
				on: {
					"CONTROLLED.OPEN": [
						{
							guard: "isTriggerClickEvent",
							target: "open",
							actions: ["setInitialFocus", "highlightFirstSelectedItem"]
						},
						{
							guard: "isTriggerArrowUpEvent",
							target: "open",
							actions: ["setInitialFocus", "highlightComputedLastItem"]
						},
						{
							guard: px("isTriggerArrowDownEvent", "isTriggerEnterEvent"),
							target: "open",
							actions: ["setInitialFocus", "highlightComputedFirstItem"]
						},
						{
							target: "open",
							actions: ["setInitialFocus"]
						}
					],
					OPEN: [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: ["setInitialFocus", "invokeOnOpen"]
					}],
					"TRIGGER.BLUR": { target: "idle" },
					"TRIGGER.CLICK": [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"setInitialFocus",
							"invokeOnOpen",
							"highlightFirstSelectedItem"
						]
					}],
					"TRIGGER.ENTER": [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"setInitialFocus",
							"invokeOnOpen",
							"highlightComputedFirstItem"
						]
					}],
					"TRIGGER.ARROW_UP": [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"setInitialFocus",
							"invokeOnOpen",
							"highlightComputedLastItem"
						]
					}],
					"TRIGGER.ARROW_DOWN": [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"setInitialFocus",
							"invokeOnOpen",
							"highlightComputedFirstItem"
						]
					}],
					"TRIGGER.ARROW_LEFT": [{
						guard: dx(fx("multiple"), "hasSelectedItems"),
						actions: ["selectPreviousItem"]
					}, {
						guard: fx("multiple"),
						actions: ["selectLastItem"]
					}],
					"TRIGGER.ARROW_RIGHT": [{
						guard: dx(fx("multiple"), "hasSelectedItems"),
						actions: ["selectNextItem"]
					}, {
						guard: fx("multiple"),
						actions: ["selectFirstItem"]
					}],
					"TRIGGER.HOME": {
						guard: fx("multiple"),
						actions: ["selectFirstItem"]
					},
					"TRIGGER.END": {
						guard: fx("multiple"),
						actions: ["selectLastItem"]
					},
					"TRIGGER.TYPEAHEAD": {
						guard: fx("multiple"),
						actions: ["selectMatchingItem"]
					}
				}
			},
			open: {
				tags: ["open"],
				exit: ["scrollContentToTop"],
				effects: [
					"trackDismissableElement",
					"trackFocusVisible",
					"computePlacement",
					"scrollToHighlightedItem"
				],
				on: {
					"CONTROLLED.CLOSE": [{
						guard: "restoreFocus",
						target: "focused",
						actions: ["focusTriggerEl", "clearHighlightedItem"]
					}, {
						target: "idle",
						actions: ["clearHighlightedItem"]
					}],
					CLOSE: [
						{
							guard: "isOpenControlled",
							actions: ["invokeOnClose"]
						},
						{
							guard: "restoreFocus",
							target: "focused",
							actions: [
								"invokeOnClose",
								"focusTriggerEl",
								"clearHighlightedItem"
							]
						},
						{
							target: "idle",
							actions: ["invokeOnClose", "clearHighlightedItem"]
						}
					],
					"TRIGGER.CLICK": [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose"]
					}, {
						target: "focused",
						actions: ["invokeOnClose", "clearHighlightedItem"]
					}],
					"ITEM.CLICK": [
						{
							guard: dx("closeOnSelect", "isOpenControlled"),
							actions: ["selectHighlightedItem", "invokeOnClose"]
						},
						{
							guard: "closeOnSelect",
							target: "focused",
							actions: [
								"selectHighlightedItem",
								"invokeOnClose",
								"focusTriggerEl",
								"clearHighlightedItem"
							]
						},
						{ actions: ["selectHighlightedItem"] }
					],
					"CONTENT.HOME": { actions: ["highlightFirstItem"] },
					"CONTENT.END": { actions: ["highlightLastItem"] },
					"CONTENT.ARROW_DOWN": [
						{
							guard: dx("hasHighlightedItem", "loop", "isLastItemHighlighted"),
							actions: ["highlightFirstItem"]
						},
						{
							guard: "hasHighlightedItem",
							actions: ["highlightNextItem"]
						},
						{ actions: ["highlightFirstItem"] }
					],
					"CONTENT.ARROW_UP": [
						{
							guard: dx("hasHighlightedItem", "loop", "isFirstItemHighlighted"),
							actions: ["highlightLastItem"]
						},
						{
							guard: "hasHighlightedItem",
							actions: ["highlightPreviousItem"]
						},
						{ actions: ["highlightLastItem"] }
					],
					"CONTENT.TYPEAHEAD": { actions: ["highlightMatchingItem"] },
					"ITEM.POINTER_MOVE": { actions: ["highlightItem"] },
					"ITEM.POINTER_LEAVE": { actions: ["clearHighlightedItem"] },
					"POSITIONING.SET": { actions: ["reposition"] }
				}
			}
		},
		implementations: {
			guards: {
				loop: ({ prop: e }) => !!e("loopFocus"),
				multiple: ({ prop: e }) => !!e("multiple"),
				hasSelectedItems: ({ computed: e }) => !!e("hasSelectedItems"),
				hasHighlightedItem: ({ context: e }) => e.get("highlightedValue") != null,
				isFirstItemHighlighted: ({ context: e, prop: t }) => e.get("highlightedValue") === t("collection").firstValue,
				isLastItemHighlighted: ({ context: e, prop: t }) => e.get("highlightedValue") === t("collection").lastValue,
				closeOnSelect: ({ prop: e, event: t }) => !!(t.closeOnSelect ?? e("closeOnSelect")),
				restoreFocus: ({ event: e }) => ux(e),
				isOpenControlled: ({ prop: e }) => e("open") !== void 0,
				isTriggerClickEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.CLICK",
				isTriggerEnterEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.ENTER",
				isTriggerArrowUpEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.ARROW_UP",
				isTriggerArrowDownEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.ARROW_DOWN"
			},
			effects: {
				trackFocusVisible({ scope: e }) {
					return kh({ root: e.getRootNode?.() });
				},
				trackFormControlState({ context: e, scope: t }) {
					return Xl(vb(t), {
						onFieldsetDisabledChange(t) {
							e.set("fieldsetDisabled", t);
						},
						onFormReset() {
							let t = e.initial("value");
							e.set("value", t);
						}
					});
				},
				trackDismissableElement({ scope: e, send: t, prop: n }) {
					let r = () => yb(e), i = !0;
					return sx(r, {
						type: "listbox",
						defer: !0,
						exclude: [bb(e), xb(e)],
						onFocusOutside: n("onFocusOutside"),
						onPointerDownOutside: n("onPointerDownOutside"),
						onInteractOutside(e) {
							n("onInteractOutside")?.(e), i = !(e.detail.focusable || e.detail.contextmenu);
						},
						onDismiss() {
							t({
								type: "CLOSE",
								src: "interact-outside",
								restoreFocus: i
							});
						}
					});
				},
				computePlacement({ context: e, prop: t, scope: n }) {
					let r = t("positioning");
					return e.set("currentPlacement", r.placement), Qy(() => bb(n), () => Sb(n), {
						defer: !0,
						...r,
						onComplete(t) {
							e.set("currentPlacement", t.placement);
						}
					});
				},
				scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
					let r = (r) => {
						let i = e.get("highlightedValue");
						if (i == null || Eh() === "pointer") return;
						let a = yb(n), o = t("scrollToIndexFn");
						if (o) {
							let e = t("collection").indexOf(i);
							o?.({
								index: e,
								immediate: r,
								getElement: () => Cb(n, i)
							});
							return;
						}
						dd(Cb(n, i), {
							rootEl: a,
							block: "nearest"
						});
					};
					return J(() => {
						Dh("virtual"), r(!0);
					}), Cu(() => yb(n), {
						defer: !0,
						attributes: ["data-activedescendant"],
						callback() {
							r(!1);
						}
					});
				}
			},
			actions: {
				reposition({ context: e, prop: t, scope: n, event: r }) {
					Qy(bb(n), () => Sb(n), {
						...t("positioning"),
						...r.options,
						defer: !0,
						listeners: !1,
						onComplete(t) {
							e.set("currentPlacement", t.placement);
						}
					});
				},
				toggleVisibility({ send: e, prop: t, event: n }) {
					e({
						type: t("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
						previousEvent: n
					});
				},
				highlightPreviousItem({ context: e, prop: t }) {
					let n = e.get("highlightedValue");
					if (n == null) return;
					let r = t("collection").getPreviousValue(n, 1, t("loopFocus"));
					r != null && e.set("highlightedValue", r);
				},
				highlightNextItem({ context: e, prop: t }) {
					let n = e.get("highlightedValue");
					if (n == null) return;
					let r = t("collection").getNextValue(n, 1, t("loopFocus"));
					r != null && e.set("highlightedValue", r);
				},
				highlightFirstItem({ context: e, prop: t }) {
					let n = t("collection").firstValue;
					e.set("highlightedValue", n);
				},
				highlightLastItem({ context: e, prop: t }) {
					let n = t("collection").lastValue;
					e.set("highlightedValue", n);
				},
				setInitialFocus({ scope: e }) {
					J(() => {
						hu({ root: yb(e) })?.focus({ preventScroll: !0 });
					});
				},
				focusTriggerEl({ event: e, scope: t }) {
					ux(e) && J(() => {
						bb(t)?.focus({ preventScroll: !0 });
					});
				},
				selectHighlightedItem({ context: e, prop: t, event: n }) {
					let r = n.value ?? e.get("highlightedValue");
					r == null || !t("collection").has(r) || (t("onSelect")?.({ value: r }), r = t("deselectable") && !t("multiple") && e.get("value").includes(r) ? null : r, e.set("value", (e) => r == null ? [] : t("multiple") ? qd(e, r) : [r]));
				},
				highlightComputedFirstItem({ context: e, prop: t, computed: n }) {
					let r = t("collection"), i = n("hasSelectedItems") ? r.sort(e.get("value"))[0] : r.firstValue;
					e.set("highlightedValue", i);
				},
				highlightComputedLastItem({ context: e, prop: t, computed: n }) {
					let r = t("collection"), i = n("hasSelectedItems") ? r.sort(e.get("value"))[0] : r.lastValue;
					e.set("highlightedValue", i);
				},
				highlightFirstSelectedItem({ context: e, prop: t, computed: n }) {
					if (!n("hasSelectedItems")) return;
					let r = t("collection").sort(e.get("value"))[0];
					e.set("highlightedValue", r);
				},
				highlightItem({ context: e, event: t }) {
					e.set("highlightedValue", t.value);
				},
				highlightMatchingItem({ context: e, prop: t, event: n, refs: r }) {
					let i = t("collection").search(n.key, {
						state: r.get("typeahead"),
						currentValue: e.get("highlightedValue")
					});
					i != null && e.set("highlightedValue", i);
				},
				setHighlightedItem({ context: e, event: t }) {
					e.set("highlightedValue", t.value);
				},
				clearHighlightedItem({ context: e }) {
					e.set("highlightedValue", null);
				},
				selectItem({ context: e, prop: t, event: n }) {
					t("onSelect")?.({ value: n.value });
					let r = t("deselectable") && !t("multiple") && e.get("value").includes(n.value) ? null : n.value;
					e.set("value", (e) => r == null ? [] : t("multiple") ? qd(e, r) : [r]);
				},
				clearItem({ context: e, event: t }) {
					e.set("value", (e) => e.filter((e) => e !== t.value));
				},
				setSelectedItems({ context: e, event: t }) {
					e.set("value", t.value);
				},
				clearSelectedItems({ context: e }) {
					e.set("value", []);
				},
				selectPreviousItem({ context: e, prop: t }) {
					let [n] = e.get("value"), r = t("collection").getPreviousValue(n);
					r && e.set("value", [r]);
				},
				selectNextItem({ context: e, prop: t }) {
					let [n] = e.get("value"), r = t("collection").getNextValue(n);
					r && e.set("value", [r]);
				},
				selectFirstItem({ context: e, prop: t }) {
					let n = t("collection").firstValue;
					n && e.set("value", [n]);
				},
				selectLastItem({ context: e, prop: t }) {
					let n = t("collection").lastValue;
					n && e.set("value", [n]);
				},
				selectMatchingItem({ context: e, prop: t, event: n, refs: r }) {
					let i = t("collection").search(n.key, {
						state: r.get("typeahead"),
						currentValue: e.get("value")[0]
					});
					i != null && e.set("value", [i]);
				},
				scrollContentToTop({ prop: e, scope: t }) {
					if (e("scrollToIndexFn")) {
						let n = e("collection").firstValue;
						e("scrollToIndexFn")?.({
							index: 0,
							immediate: !0,
							getElement: () => Cb(t, n)
						});
					} else yb(t)?.scrollTo(0, 0);
				},
				invokeOnOpen({ prop: e, context: t }) {
					e("onOpenChange")?.({
						open: !0,
						value: t.get("value")
					});
				},
				invokeOnClose({ prop: e, context: t }) {
					e("onOpenChange")?.({
						open: !1,
						value: t.get("value")
					});
				},
				syncSelectElement({ context: e, prop: t, scope: n }) {
					let r = vb(n);
					if (r) {
						if (e.get("value").length === 0 && !t("multiple")) {
							r.selectedIndex = -1;
							return;
						}
						for (let t of r.options) t.selected = e.get("value").includes(t.value);
					}
				},
				syncCollection({ context: e, prop: t }) {
					let n = t("collection"), r = n.find(e.get("highlightedValue"));
					r && e.set("highlightedItem", r);
					let i = Hg({
						values: e.get("value"),
						collection: n,
						selectedItemMap: e.get("selectedItemMap")
					});
					e.set("selectedItemMap", i.nextSelectedItemMap);
				},
				syncSelectedItems({ context: e, prop: t }) {
					let n = Hg({
						values: e.get("value"),
						collection: t("collection"),
						selectedItemMap: e.get("selectedItemMap")
					});
					e.set("selectedItemMap", n.nextSelectedItemMap);
				},
				syncHighlightedItem({ context: e, prop: t }) {
					let n = t("collection"), r = e.get("highlightedValue"), i = r ? n.find(r) : null;
					e.set("highlightedItem", i);
				},
				dispatchChangeEvent({ scope: e }) {
					queueMicrotask(() => {
						let t = vb(e);
						if (!t) return;
						let n = new (e.getWin()).Event("change", {
							bubbles: !0,
							composed: !0
						});
						t.dispatchEvent(Ql(n));
					});
				}
			}
		}
	});
})), gx = t((() => {})), _x = t((() => {
	C_(), Db(), hx(), gx();
})), vx, yx, bx = t((() => {
	lc(), vx = ac("tooltip").parts("trigger", "arrow", "arrowTip", "positioner", "content"), yx = vx.build();
})), xx, Sx, Cx, wx, Tx, Ex, Dx, Ox, kx = t((() => {
	Y(), X(), xx = (e, t) => {
		let n = e.ids?.trigger;
		return n == null ? t ? `tooltip:${e.id}:trigger:${t}` : `tooltip:${e.id}:trigger` : af(n) ? n(t) : n;
	}, Sx = (e) => e.ids?.content ?? `tooltip:${e.id}:content`, Cx = (e) => e.ids?.arrow ?? `tooltip:${e.id}:arrow`, wx = (e) => e.ids?.positioner ?? `tooltip:${e.id}:popper`, Tx = (e) => e.getById(xx(e)), Ex = (e) => e.getById(wx(e)), Dx = (e) => Xu(e.getRootNode(), `[data-scope="tooltip"][data-part="trigger"][data-ownedby="${e.id}"]`), Ox = (e, t) => t == null ? Tx(e) ?? Dx(e)[0] : e.getById(xx(e, t));
})), Ax, jx = t((() => {
	X(), Ax = Xf({
		id: null,
		prevId: null,
		instant: !1
	});
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+tooltip@1.42.0/node_modules/@zag-js/tooltip/dist/tooltip.connect.mjs
function Mx(e, t) {
	let { state: n, context: r, send: i, scope: a, prop: o, event: s } = e, c = o("id"), l = !!o("aria-label"), u = n.matches("open", "closing"), d = r.get("triggerValue"), f = r.get("currentPlacement"), p = f ? Ly(f) : void 0, m = Sx(a), h = o("disabled"), g = rb({
		...o("positioning"),
		placement: f
	});
	return {
		open: u,
		setOpen(e) {
			n.matches("open", "closing") !== e && i({ type: e ? "open" : "close" });
		},
		triggerValue: d,
		setTriggerValue(e) {
			i({
				type: "triggerValue.set",
				value: e ?? void 0
			});
		},
		reposition(e = {}) {
			i({
				type: "positioning.set",
				options: e
			});
		},
		getTriggerProps(e = {}) {
			let { value: n } = e, r = n != null && d === n, s = xx(a, n);
			return t.button({
				...yx.trigger.attrs,
				id: s,
				"data-ownedby": a.id,
				"data-value": n,
				"data-current": K(r),
				dir: o("dir"),
				"data-expanded": K(u),
				"data-state": u ? "open" : "closed",
				"aria-describedby": u ? m : void 0,
				onClick(e) {
					e.defaultPrevented || h || o("closeOnClick") && i({
						type: u && n != null && !r ? "triggerValue.set" : "close",
						src: "trigger.click",
						value: n,
						triggerId: s
					});
				},
				onFocus(e) {
					e.defaultPrevented || h || Oh() && i({
						type: u && n != null && !r ? "triggerValue.set" : "open",
						src: "trigger.focus",
						value: n,
						triggerId: s
					});
				},
				onBlur(e) {
					e.defaultPrevented || h || c === Ax.get("id") && ((e.relatedTarget ?? a.getDoc().activeElement)?.closest(`[data-ownedby="${a.id}"]`) ?? i({
						type: "close",
						src: "trigger.blur",
						value: n,
						triggerId: s
					}));
				},
				onPointerDown(e) {
					e.defaultPrevented || h || Nl(e) && o("closeOnPointerDown") && c === Ax.get("id") && i({
						type: "close",
						src: "trigger.pointerdown",
						value: n,
						triggerId: s
					});
				},
				onPointerMove(e) {
					e.defaultPrevented || h || e.pointerType !== "touch" && i({
						type: u && n != null && !r ? "triggerValue.set" : "pointer.move",
						value: n,
						triggerId: s
					});
				},
				onPointerOver(e) {
					e.defaultPrevented || h || e.pointerType !== "touch" && i({
						type: "pointer.move",
						value: n,
						triggerId: s
					});
				},
				onPointerLeave() {
					h || i({ type: "pointer.leave" });
				},
				onPointerCancel() {
					h || i({ type: "pointer.leave" });
				}
			});
		},
		getArrowProps() {
			return t.element({
				id: Cx(a),
				...yx.arrow.attrs,
				dir: o("dir"),
				style: g.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...yx.arrowTip.attrs,
				dir: o("dir"),
				style: g.arrowTip
			});
		},
		getPositionerProps() {
			return t.element({
				id: wx(a),
				...yx.positioner.attrs,
				dir: o("dir"),
				style: g.floating
			});
		},
		getContentProps() {
			let e = Ax.get("id") === c, n = Ax.get("prevId") === c, r = Ax.get("instant") && (u && e || n);
			return t.element({
				...yx.content.attrs,
				dir: o("dir"),
				hidden: !u,
				"data-state": u ? "open" : "closed",
				"data-instant": K(r),
				role: l ? void 0 : "tooltip",
				id: l ? void 0 : m,
				"data-placement": f,
				"data-side": p,
				onPointerEnter() {
					i({ type: "content.pointer.move" });
				},
				onPointerLeave() {
					i({ type: "content.pointer.leave" });
				},
				style: { pointerEvents: o("interactive") ? "auto" : "none" }
			});
		}
	};
}
var Nx = t((() => {
	Y(), Rh(), ob(), bx(), kx(), jx();
})), Px, Fx, Ix, Lx = t((() => {
	um(), Y(), Rh(), ob(), X(), kx(), jx(), {and: Px, not: Fx} = tm(), Ix = nm({
		initialState: ({ prop: e }) => e("open") || e("defaultOpen") ? "open" : "closed",
		props({ props: e }) {
			np(e, ["id"]);
			let t = e.closeOnClick ?? !0, n = e.closeOnPointerDown ?? t;
			return {
				openDelay: 400,
				closeDelay: 150,
				closeOnEscape: !0,
				interactive: !1,
				closeOnScroll: !0,
				disabled: !1,
				...e,
				closeOnPointerDown: n,
				closeOnClick: t,
				positioning: {
					placement: "bottom",
					...e.positioning
				}
			};
		},
		effects: ["trackFocusVisible", "trackStore"],
		context: ({ bindable: e, prop: t, scope: n }) => ({
			currentPlacement: e(() => ({ defaultValue: void 0 })),
			hasPointerMoveOpened: e(() => ({ defaultValue: null })),
			triggerValue: e(() => ({
				defaultValue: t("defaultTriggerValue") ?? null,
				value: t("triggerValue"),
				onChange(e) {
					let r = t("onTriggerValueChange");
					r && r({
						value: e,
						triggerElement: Ox(n, e)
					});
				}
			}))
		}),
		watch({ track: e, action: t, prop: n }) {
			e([() => n("disabled")], () => {
				t(["closeIfDisabled"]);
			}), e([() => n("open")], () => {
				t(["toggleVisibility"]);
			}), e([() => n("triggerValue")], () => {
				t(["repositionImmediate"]);
			});
		},
		on: { "triggerValue.set": { actions: ["setTriggerValue", "repositionImmediate"] } },
		states: {
			closed: {
				entry: ["clearGlobalId"],
				on: {
					"controlled.open": { target: "open" },
					open: [{
						guard: "isOpenControlled",
						actions: ["setTriggerValue", "invokeOnOpen"]
					}, {
						target: "open",
						actions: ["setTriggerValue", "invokeOnOpen"]
					}],
					"pointer.leave": { actions: ["clearPointerMoveOpened"] },
					"pointer.move": [{
						guard: Px("noVisibleTooltip", Fx("hasPointerMoveOpened")),
						target: "opening",
						actions: ["setTriggerValue"]
					}, {
						guard: Fx("hasPointerMoveOpened"),
						target: "open",
						actions: [
							"setPointerMoveOpened",
							"invokeOnOpen",
							"setTriggerValue"
						]
					}]
				}
			},
			opening: {
				effects: [
					"trackScroll",
					"trackPointerlockChange",
					"waitForOpenDelay"
				],
				on: {
					"after.openDelay": [{
						guard: "isOpenControlled",
						actions: ["setPointerMoveOpened", "invokeOnOpen"]
					}, {
						target: "open",
						actions: ["setPointerMoveOpened", "invokeOnOpen"]
					}],
					"controlled.open": { target: "open" },
					"controlled.close": { target: "closed" },
					open: [{
						guard: "isOpenControlled",
						actions: ["setTriggerValue", "invokeOnOpen"]
					}, {
						target: "open",
						actions: ["setTriggerValue", "invokeOnOpen"]
					}],
					"pointer.leave": [{
						guard: "isOpenControlled",
						actions: [
							"clearPointerMoveOpened",
							"invokeOnClose",
							"toggleVisibility"
						]
					}, {
						target: "closed",
						actions: ["clearPointerMoveOpened", "invokeOnClose"]
					}],
					close: [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose", "toggleVisibility"]
					}, {
						target: "closed",
						actions: ["invokeOnClose"]
					}]
				}
			},
			open: {
				effects: [
					"trackEscapeKey",
					"trackScroll",
					"trackPointerlockChange",
					"trackPositioning"
				],
				entry: ["setGlobalId"],
				on: {
					"controlled.close": { target: "closed" },
					close: [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose"]
					}, {
						target: "closed",
						actions: ["invokeOnClose"]
					}],
					"pointer.leave": [
						{
							guard: "isVisible",
							target: "closing",
							actions: ["clearPointerMoveOpened"]
						},
						{
							guard: "isOpenControlled",
							actions: ["clearPointerMoveOpened", "invokeOnClose"]
						},
						{
							target: "closed",
							actions: ["clearPointerMoveOpened", "invokeOnClose"]
						}
					],
					"content.pointer.leave": {
						guard: "isInteractive",
						target: "closing"
					},
					"positioning.set": { actions: ["reposition"] },
					"triggerValue.set": {
						target: "closing",
						actions: ["setTriggerValue", "immediateReopen"]
					}
				}
			},
			closing: {
				effects: ["trackPositioning", "waitForCloseDelay"],
				on: {
					"after.closeDelay": [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose"]
					}, {
						target: "closed",
						actions: ["invokeOnClose"]
					}],
					"controlled.close": { target: "closed" },
					"controlled.open": { target: "open" },
					close: [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose"]
					}, {
						target: "closed",
						actions: ["invokeOnClose"]
					}],
					"pointer.move": [{
						guard: "isOpenControlled",
						actions: [
							"setPointerMoveOpened",
							"setTriggerValue",
							"invokeOnOpen",
							"toggleVisibility"
						]
					}, {
						target: "open",
						actions: [
							"setPointerMoveOpened",
							"setTriggerValue",
							"invokeOnOpen"
						]
					}],
					"triggerValue.set": {
						target: "open",
						actions: ["setTriggerValue", "repositionImmediate"]
					},
					reopen: { target: "open" },
					"content.pointer.move": {
						guard: "isInteractive",
						target: "open"
					},
					"positioning.set": { actions: ["reposition"] }
				}
			}
		},
		implementations: {
			guards: {
				noVisibleTooltip: () => Ax.get("id") === null,
				isVisible: ({ prop: e }) => e("id") === Ax.get("id"),
				isInteractive: ({ prop: e }) => !!e("interactive"),
				hasPointerMoveOpened: ({ context: e }) => !!e.get("hasPointerMoveOpened"),
				isOpenControlled: ({ prop: e }) => e("open") !== void 0
			},
			actions: {
				setGlobalId: ({ prop: e }) => {
					let t = Ax.get("id"), n = t !== null && t !== e("id");
					Ax.update({
						id: e("id"),
						prevId: n ? t : null,
						instant: n
					});
				},
				clearGlobalId: ({ prop: e }) => {
					e("id") === Ax.get("id") && Ax.update({
						id: null,
						prevId: null,
						instant: !1
					});
				},
				invokeOnOpen: ({ prop: e }) => {
					e("onOpenChange")?.({ open: !0 });
				},
				invokeOnClose: ({ prop: e }) => {
					e("onOpenChange")?.({ open: !1 });
				},
				closeIfDisabled: ({ prop: e, send: t }) => {
					e("disabled") && t({
						type: "close",
						src: "disabled.change"
					});
				},
				reposition: ({ context: e, event: t, prop: n, scope: r }) => {
					t.type === "positioning.set" && Qy(() => Ox(r, e.get("triggerValue")), () => Ex(r), {
						...n("positioning"),
						...t.options,
						listeners: !1,
						onComplete(t) {
							e.set("currentPlacement", t.placement);
						}
					});
				},
				repositionImmediate: ({ context: e, event: t, prop: n, scope: r }) => {
					let i = t.value ?? e.get("triggerValue");
					return Qy(() => Ox(r, i), () => Ex(r), {
						...n("positioning"),
						onComplete(t) {
							e.set("currentPlacement", t.placement);
						}
					});
				},
				toggleVisibility: ({ prop: e, event: t, send: n }) => {
					queueMicrotask(() => {
						n({
							type: e("open") ? "controlled.open" : "controlled.close",
							previousEvent: t
						});
					});
				},
				setPointerMoveOpened: ({ context: e, event: t }) => {
					let n = t.triggerId ?? t.previousEvent?.triggerId;
					e.set("hasPointerMoveOpened", n ?? null);
				},
				clearPointerMoveOpened: ({ context: e }) => {
					e.set("hasPointerMoveOpened", null);
				},
				setTriggerValue: ({ context: e, event: t }) => {
					t.value !== void 0 && e.set("triggerValue", t.value);
				},
				immediateReopen: ({ send: e }) => {
					queueMicrotask(() => {
						e({ type: "reopen" });
					});
				}
			},
			effects: {
				trackFocusVisible: ({ scope: e }) => kh({ root: e.getRootNode?.() }),
				trackPositioning: ({ context: e, prop: t, scope: n }) => (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), Qy(() => Ox(n, e.get("triggerValue")), () => Ex(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				})),
				trackPointerlockChange: ({ send: e, scope: t }) => {
					let n = t.getDoc();
					return q(n, "pointerlockchange", () => e({
						type: "close",
						src: "pointerlock:change"
					}), !1);
				},
				trackScroll: ({ send: e, prop: t, scope: n, context: r }) => {
					if (!t("closeOnScroll")) return;
					let i = r.get("triggerValue"), a = Ox(n, i);
					if (!a) return;
					let o = Au(a).map((t) => q(t, "scroll", () => {
						e({
							type: "close",
							src: "scroll"
						});
					}, {
						passive: !0,
						capture: !0
					}));
					return () => {
						o.forEach((e) => e?.());
					};
				},
				trackStore: ({ prop: e, send: t }) => {
					let n;
					return queueMicrotask(() => {
						n = Ax.subscribe(() => {
							Ax.get("id") !== e("id") && t({
								type: "close",
								src: "id.change"
							});
						});
					}), () => n?.();
				},
				trackEscapeKey: ({ send: e, prop: t }) => t("closeOnEscape") ? q(document, "keydown", (t) => {
					Tl(t) || t.key === "Escape" && (t.stopPropagation(), e({
						type: "close",
						src: "keydown.escape"
					}));
				}, !0) : void 0,
				waitForOpenDelay: ({ send: e, prop: t, event: n }) => {
					let r = setTimeout(() => {
						e({
							type: "after.openDelay",
							previousEvent: n
						});
					}, t("openDelay"));
					return () => clearTimeout(r);
				},
				waitForCloseDelay: ({ send: e, prop: t, event: n }) => {
					let r = setTimeout(() => {
						e({
							type: "after.closeDelay",
							previousEvent: n
						});
					}, t("closeDelay"));
					return () => clearTimeout(r);
				}
			}
		}
	});
})), Rx = t((() => {})), zx = t((() => {
	Nx(), Lx(), Rx();
})), Bx, Vx, Hx = t((() => {
	lc(), Bx = ac("combobox").parts("root", "clearTrigger", "content", "control", "input", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "label", "list", "positioner", "trigger"), Vx = Bx.build();
})), Ux, Wx = t((() => {
	x_(), Ux = (e) => new Lg(e), Ux.empty = () => new Lg({ items: [] });
})), Gx, Kx, qx, Jx, Yx, Xx, Zx, Qx, $x, eS, tS, nS, rS, iS, aS, oS, sS, cS, lS, uS, dS = t((() => {
	Y(), Gx = (e) => e.ids?.root ?? `combobox:${e.id}`, Kx = (e) => e.ids?.label ?? `combobox:${e.id}:label`, qx = (e) => e.ids?.control ?? `combobox:${e.id}:control`, Jx = (e) => e.ids?.input ?? `combobox:${e.id}:input`, Yx = (e) => e.ids?.content ?? `combobox:${e.id}:content`, Xx = (e) => e.ids?.positioner ?? `combobox:${e.id}:popper`, Zx = (e) => e.ids?.trigger ?? `combobox:${e.id}:toggle-btn`, Qx = (e) => e.ids?.clearTrigger ?? `combobox:${e.id}:clear-btn`, $x = (e, t) => e.ids?.itemGroup?.(t) ?? `combobox:${e.id}:optgroup:${t}`, eS = (e, t) => e.ids?.itemGroupLabel?.(t) ?? `combobox:${e.id}:optgroup-label:${t}`, tS = (e, t) => e.ids?.item?.(t) ?? `combobox:${e.id}:option:${t}`, nS = (e) => e.getById(Yx(e)), rS = (e) => e.getById(Jx(e)), iS = (e) => e.getById(Xx(e)), aS = (e) => e.getById(qx(e)), oS = (e) => e.getById(Zx(e)), sS = (e) => e.getById(Qx(e)), cS = (e, t) => {
		if (t == null) return null;
		let n = `[role=option][data-value="${CSS.escape(t)}"]`;
		return Zu(nS(e), n);
	}, lS = (e) => {
		let t = rS(e);
		e.isActiveElement(t) || t?.focus({ preventScroll: !0 }), _c(t);
	}, uS = (e) => {
		let t = oS(e);
		e.isActiveElement(t) || t?.focus({ preventScroll: !0 });
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+combobox@1.42.0/node_modules/@zag-js/combobox/dist/combobox.connect.mjs
function fS(e, t) {
	let { context: n, prop: r, state: i, send: a, scope: o, computed: s, event: c } = e, l = r("translations"), u = r("collection"), d = !!r("disabled"), f = s("isInteractive"), p = !!r("invalid"), m = !!r("required"), h = !!r("readOnly"), g = i.hasTag("open"), _ = i.hasTag("focused"), v = r("composite"), y = n.get("highlightedValue"), b = n.get("currentPlacement"), x = b ? Ly(b) : void 0, S = rb({
		...r("positioning"),
		placement: b
	});
	function C(e) {
		let t = u.getItemDisabled(e.item), r = u.getItemValue(e.item);
		return tp(r, () => `[zag-js] No value found for item ${JSON.stringify(e.item)}`), {
			value: r,
			disabled: !!(d || t),
			highlighted: y === r,
			selected: n.get("value").includes(r)
		};
	}
	return {
		focused: _,
		open: g,
		inputValue: n.get("inputValue"),
		highlightedValue: y,
		highlightedItem: n.get("highlightedItem"),
		value: n.get("value"),
		valueAsString: s("valueAsString"),
		hasSelectedItems: s("hasSelectedItems"),
		selectedItems: s("selectedItems"),
		collection: r("collection"),
		multiple: !!r("multiple"),
		disabled: !!d,
		syncSelectedItems() {
			a({ type: "SELECTED_ITEMS.SYNC" });
		},
		reposition(e = {}) {
			a({
				type: "POSITIONING.SET",
				options: e
			});
		},
		setHighlightValue(e) {
			a({
				type: "HIGHLIGHTED_VALUE.SET",
				value: e
			});
		},
		clearHighlightValue() {
			a({ type: "HIGHLIGHTED_VALUE.CLEAR" });
		},
		selectValue(e) {
			a({
				type: "ITEM.SELECT",
				value: e
			});
		},
		setValue(e) {
			a({
				type: "VALUE.SET",
				value: e
			});
		},
		setInputValue(e, t = "script") {
			a({
				type: "INPUT_VALUE.SET",
				value: e,
				src: t
			});
		},
		clearValue(e) {
			a(e == null ? { type: "VALUE.CLEAR" } : {
				type: "ITEM.CLEAR",
				value: e
			});
		},
		focus() {
			rS(o)?.focus();
		},
		setOpen(e, t = "script") {
			i.hasTag("open") !== e && a({
				type: e ? "OPEN" : "CLOSE",
				src: t
			});
		},
		getRootProps() {
			return t.element({
				...Vx.root.attrs,
				dir: r("dir"),
				id: Gx(o),
				"data-invalid": K(p),
				"data-readonly": K(h)
			});
		},
		getLabelProps() {
			return t.label({
				...Vx.label.attrs,
				dir: r("dir"),
				htmlFor: Jx(o),
				id: Kx(o),
				"data-readonly": K(h),
				"data-disabled": K(d),
				"data-invalid": K(p),
				"data-required": K(m),
				"data-focus": K(_),
				onClick(e) {
					v || (e.preventDefault(), oS(o)?.focus({ preventScroll: !0 }));
				}
			});
		},
		getControlProps() {
			return t.element({
				...Vx.control.attrs,
				dir: r("dir"),
				id: qx(o),
				"data-state": g ? "open" : "closed",
				"data-focus": K(_),
				"data-disabled": K(d),
				"data-invalid": K(p)
			});
		},
		getPositionerProps() {
			return t.element({
				...Vx.positioner.attrs,
				dir: r("dir"),
				id: Xx(o),
				style: S.floating
			});
		},
		getInputProps() {
			return t.input({
				...Vx.input.attrs,
				dir: r("dir"),
				"aria-invalid": wc(p),
				"data-invalid": K(p),
				"data-autofocus": K(r("autoFocus")),
				name: r("name"),
				form: r("form"),
				disabled: d,
				required: r("required"),
				autoComplete: "off",
				autoCorrect: "off",
				autoCapitalize: "none",
				spellCheck: "false",
				readOnly: h,
				placeholder: r("placeholder"),
				id: Jx(o),
				type: "text",
				role: "combobox",
				defaultValue: n.get("inputValue"),
				"aria-autocomplete": s("autoComplete") ? "both" : "list",
				"aria-controls": Yx(o),
				"aria-expanded": g,
				"data-state": g ? "open" : "closed",
				"aria-activedescendant": y ? tS(o, y) : void 0,
				onClick(e) {
					e.defaultPrevented || r("openOnClick") && f && a({
						type: "INPUT.CLICK",
						src: "input-click"
					});
				},
				onFocus() {
					d || a({ type: "INPUT.FOCUS" });
				},
				onBlur() {
					d || a({ type: "INPUT.BLUR" });
				},
				onChange(e) {
					a({
						type: "INPUT.CHANGE",
						value: e.currentTarget.value,
						src: "input-change"
					});
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !f || e.ctrlKey || e.shiftKey || Tl(e)) return;
					let t = r("openOnKeyPress"), n = e.ctrlKey || e.metaKey || e.shiftKey, i = {
						ArrowDown(e) {
							!t && !g || (a({
								type: e.altKey ? "OPEN" : "INPUT.ARROW_DOWN",
								keypress: !0,
								src: "arrow-key"
							}), e.preventDefault());
						},
						ArrowUp() {
							!t && !g || (a({
								type: e.altKey ? "CLOSE" : "INPUT.ARROW_UP",
								keypress: !0,
								src: "arrow-key"
							}), e.preventDefault());
						},
						Home(e) {
							n || (a({
								type: "INPUT.HOME",
								keypress: !0
							}), g && e.preventDefault());
						},
						End(e) {
							n || (a({
								type: "INPUT.END",
								keypress: !0
							}), g && e.preventDefault());
						},
						Enter(e) {
							a({
								type: "INPUT.ENTER",
								keypress: !0,
								src: "item-select"
							});
							let t = y != null, n = r("alwaysSubmitOnEnter"), i = s("isCustomValue") && !r("allowCustomValue");
							if (g && !n && (t || i) && e.preventDefault(), y == null) return;
							let c = cS(o, y);
							Kc(c) && r("navigate")?.({
								value: y,
								node: c,
								href: c.href
							});
						},
						Escape() {
							a({
								type: "INPUT.ESCAPE",
								keypress: !0,
								src: "escape-key"
							}), e.preventDefault();
						}
					}[kl(e, { dir: r("dir") })];
					i?.(e);
				}
			});
		},
		getTriggerProps(e = {}) {
			return t.button({
				...Vx.trigger.attrs,
				dir: r("dir"),
				id: Zx(o),
				"aria-haspopup": v ? "listbox" : "dialog",
				type: "button",
				tabIndex: e.focusable ? void 0 : -1,
				"aria-label": l.triggerLabel,
				"aria-expanded": g,
				"data-state": g ? "open" : "closed",
				"aria-controls": g ? Yx(o) : void 0,
				disabled: d,
				"data-invalid": K(p),
				"data-focusable": K(e.focusable),
				"data-readonly": K(h),
				"data-disabled": K(d),
				onFocus() {
					e.focusable && a({
						type: "INPUT.FOCUS",
						src: "trigger"
					});
				},
				onClick(e) {
					e.defaultPrevented || f && Nl(e) && a({
						type: "TRIGGER.CLICK",
						src: "trigger-click"
					});
				},
				onPointerDown(e) {
					f && e.pointerType !== "touch" && Nl(e) && (e.preventDefault(), queueMicrotask(() => {
						lS(o);
					}));
				},
				onKeyDown(e) {
					if (e.defaultPrevented || v) return;
					let t = {
						ArrowDown() {
							a({
								type: "INPUT.ARROW_DOWN",
								src: "arrow-key"
							});
						},
						ArrowUp() {
							a({
								type: "INPUT.ARROW_UP",
								src: "arrow-key"
							});
						}
					}[kl(e, { dir: r("dir") })];
					t && (t(e), e.preventDefault());
				}
			});
		},
		getContentProps() {
			return t.element({
				...Vx.content.attrs,
				dir: r("dir"),
				id: Yx(o),
				role: v ? "listbox" : "dialog",
				tabIndex: -1,
				hidden: !g,
				"data-state": g ? "open" : "closed",
				"data-placement": b,
				"data-side": x,
				"aria-labelledby": Kx(o),
				"aria-multiselectable": r("multiple") && v ? !0 : void 0,
				"data-empty": K(u.size === 0),
				onPointerDown(e) {
					Nl(e) && e.preventDefault();
				}
			});
		},
		getListProps() {
			return t.element({
				...Vx.list.attrs,
				role: v ? void 0 : "listbox",
				"data-empty": K(u.size === 0),
				"aria-labelledby": Kx(o),
				"aria-multiselectable": r("multiple") && !v ? !0 : void 0
			});
		},
		getClearTriggerProps() {
			return t.button({
				...Vx.clearTrigger.attrs,
				dir: r("dir"),
				id: Qx(o),
				type: "button",
				tabIndex: -1,
				disabled: d,
				"data-invalid": K(p),
				"aria-label": l.clearTriggerLabel,
				"aria-controls": Jx(o),
				hidden: !n.get("value").length,
				onPointerDown(e) {
					Nl(e) && e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || f && a({
						type: "VALUE.CLEAR",
						src: "clear-trigger"
					});
				}
			});
		},
		getItemState: C,
		getItemProps(e) {
			let n = C(e), i = n.value;
			return t.element({
				...Vx.item.attrs,
				dir: r("dir"),
				id: tS(o, i),
				role: "option",
				tabIndex: -1,
				"data-highlighted": K(n.highlighted),
				"data-state": n.selected ? "checked" : "unchecked",
				"aria-selected": wc(n.selected),
				"aria-disabled": wc(n.disabled),
				"data-disabled": K(n.disabled),
				"data-value": n.value,
				onPointerMove() {
					n.disabled || n.highlighted || a({
						type: "ITEM.POINTER_MOVE",
						value: i
					});
				},
				onPointerLeave() {
					e.persistFocus || n.disabled || c.previous()?.type.includes("POINTER") && a({
						type: "ITEM.POINTER_LEAVE",
						value: i
					});
				},
				onClick(e) {
					wl(e) || Cl(e) || Pl(e) || n.disabled || a({
						type: "ITEM.CLICK",
						src: "item-select",
						value: i
					});
				}
			});
		},
		getItemTextProps(e) {
			let n = C(e);
			return t.element({
				...Vx.itemText.attrs,
				dir: r("dir"),
				"data-state": n.selected ? "checked" : "unchecked",
				"data-disabled": K(n.disabled),
				"data-highlighted": K(n.highlighted)
			});
		},
		getItemIndicatorProps(e) {
			let n = C(e);
			return t.element({
				"aria-hidden": !0,
				...Vx.itemIndicator.attrs,
				dir: r("dir"),
				"data-state": n.selected ? "checked" : "unchecked",
				hidden: !n.selected
			});
		},
		getItemGroupProps(e) {
			let { id: n } = e;
			return t.element({
				...Vx.itemGroup.attrs,
				dir: r("dir"),
				id: $x(o, n),
				"aria-labelledby": eS(o, n),
				"data-empty": K(u.size === 0),
				role: "group"
			});
		},
		getItemGroupLabelProps(e) {
			let { htmlFor: n } = e;
			return t.element({
				...Vx.itemGroupLabel.attrs,
				dir: r("dir"),
				id: eS(o, n),
				role: "presentation"
			});
		}
	};
}
var pS = t((() => {
	Y(), ob(), X(), Hx(), dS();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+live-region@1.42.0/node_modules/@zag-js/live-region/dist/index.mjs
function mS(e = {}) {
	let { level: t = "polite", document: n = document, root: r, delay: i = 0, debug: a = !1 } = e, o = n.defaultView ?? window, s = r ?? n.body;
	function c() {
		if (!a) return;
		let e = n.getElementById(gS);
		return e || (e = n.createElement("div"), e.id = gS, e.dataset.liveAnnouncerDebug = "true", e.setAttribute("aria-hidden", "true"), e.style.cssText = _S, s.appendChild(e), e);
	}
	function l(e, r) {
		n.getElementById(hS)?.remove(), r ??= i;
		let a = n.createElement("span");
		a.id = hS, a.dataset.liveAnnouncer = "true";
		let l = t === "assertive" ? "alert" : "status";
		a.setAttribute("aria-live", t), a.setAttribute("role", l), Object.assign(a.style, {
			border: "0",
			clip: "rect(0 0 0 0)",
			height: "1px",
			margin: "-1px",
			overflow: "hidden",
			padding: "0",
			position: "absolute",
			width: "1px",
			whiteSpace: "nowrap",
			wordWrap: "normal"
		}), s.appendChild(a), o.setTimeout(() => {
			if (!a.isConnected) return;
			a.textContent = e;
			let t = c();
			t && (t.textContent = e);
		}, r);
	}
	function u() {
		n.getElementById(hS)?.remove(), n.getElementById(gS)?.remove();
	}
	return {
		announce: l,
		destroy: u,
		toJSON() {
			return hS;
		}
	};
}
var hS, gS, _S, vS = t((() => {
	hS = "__live-region__", gS = "__live-region-debug__", _S = "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:12px 16px;background:black;color:white;font-size:14px;line-height:20px;text-align:center;pointer-events:none;";
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+combobox@1.42.0/node_modules/@zag-js/combobox/dist/combobox.machine.mjs
function yS(e) {
	return (e.previousEvent || e).src;
}
var bS, xS, SS, CS, wS, TS, ES = t((() => {
	x_(), um(), lx(), Y(), Rh(), vS(), ob(), X(), Wx(), dS(), {guards: bS, createMachine: xS, choose: SS} = rm(), {and: CS, not: wS} = bS, TS = xS({
		props({ props: e }) {
			return {
				loopFocus: !0,
				openOnClick: !1,
				defaultValue: [],
				defaultInputValue: "",
				closeOnSelect: !e.multiple,
				allowCustomValue: !1,
				alwaysSubmitOnEnter: !1,
				inputBehavior: "none",
				selectionBehavior: e.multiple ? "clear" : "replace",
				openOnKeyPress: !0,
				openOnChange: !0,
				composite: !0,
				navigate({ node: e }) {
					Du(e);
				},
				collection: Ux.empty(),
				...e,
				positioning: {
					placement: "bottom",
					sameWidth: !0,
					...e.positioning
				},
				translations: {
					triggerLabel: "Toggle suggestions",
					clearTriggerLabel: "Clear value",
					...e.translations
				}
			};
		},
		initialState({ prop: e }) {
			return e("open") || e("defaultOpen") ? "open.suggesting" : "closed.idle";
		},
		context({ prop: e, bindable: t, getContext: n, getEvent: r }) {
			let i = e("value") ?? e("defaultValue") ?? [], a = e("collection").findMany(i);
			return {
				currentPlacement: t(() => ({ defaultValue: void 0 })),
				value: t(() => ({
					defaultValue: e("defaultValue"),
					value: e("value"),
					isEqual: Zd,
					hash(e) {
						return e.join(",");
					},
					onChange(t) {
						let r = n(), i = e("collection"), a = Hg({
							values: t,
							collection: i,
							selectedItemMap: r.get("selectedItemMap")
						}), o = e("value") ?? t, s = o === t ? a : Hg({
							values: o,
							collection: i,
							selectedItemMap: a.nextSelectedItemMap
						});
						r.set("selectedItemMap", s.nextSelectedItemMap), e("onValueChange")?.({
							value: t,
							items: a.selectedItems
						});
					}
				})),
				highlightedValue: t(() => ({
					defaultValue: e("defaultHighlightedValue") || null,
					value: e("highlightedValue"),
					onChange(t) {
						let n = e("collection").find(t);
						e("onHighlightChange")?.({
							highlightedValue: t,
							highlightedItem: n
						});
					}
				})),
				inputValue: t(() => {
					let t = e("inputValue") || e("defaultInputValue"), n = e("value") || e("defaultValue");
					if (!t.trim() && !e("multiple")) {
						let r = e("collection").stringifyMany(n);
						t = gf(e("selectionBehavior"), {
							preserve: t || r,
							replace: r,
							clear: ""
						});
					}
					return {
						defaultValue: t,
						value: e("inputValue"),
						onChange(t) {
							let n = r(), i = (n.previousEvent || n).src;
							e("onInputValueChange")?.({
								inputValue: t,
								reason: i
							});
						}
					};
				}),
				highlightedItem: t(() => {
					let t = e("highlightedValue");
					return { defaultValue: e("collection").find(t) };
				}),
				selectedItemMap: t(() => ({ defaultValue: Ug({
					selectedItems: a,
					collection: e("collection")
				}) }))
			};
		},
		computed: {
			isInputValueEmpty: ({ context: e }) => e.get("inputValue").length === 0,
			isInteractive: ({ prop: e }) => !(e("readOnly") || e("disabled")),
			autoComplete: ({ prop: e }) => e("inputBehavior") === "autocomplete",
			autoHighlight: ({ prop: e }) => e("inputBehavior") === "autohighlight",
			hasSelectedItems: ({ context: e }) => e.get("value").length > 0,
			selectedItems: ({ context: e, prop: t }) => Bg({
				values: e.get("value"),
				collection: t("collection"),
				selectedItemMap: e.get("selectedItemMap")
			}),
			valueAsString: ({ computed: e, prop: t }) => t("collection").stringifyItems(e("selectedItems")),
			isCustomValue: ({ context: e, computed: t }) => e.get("inputValue") !== t("valueAsString")
		},
		watch({ context: e, prop: t, track: n, action: r, send: i }) {
			n([() => e.hash("value")], () => {
				r(["syncSelectedItems"]);
			}), n([() => e.get("inputValue")], () => {
				r(["syncInputValue"]);
			}), n([() => e.get("highlightedValue")], () => {
				r([
					"syncHighlightedItem",
					"autofillInputValue",
					"announceHighlightedItem"
				]);
			}), n([() => t("open")], () => {
				r(["toggleVisibility"]);
			}), n([() => t("collection").toString()], () => {
				i({ type: "CHILDREN_CHANGE" });
			});
		},
		on: {
			"SELECTED_ITEMS.SYNC": { actions: ["syncSelectedItems"] },
			"HIGHLIGHTED_VALUE.SET": { actions: ["setHighlightedValue"] },
			"HIGHLIGHTED_VALUE.CLEAR": { actions: ["clearHighlightedValue"] },
			"ITEM.SELECT": { actions: ["selectItem"] },
			"ITEM.CLEAR": { actions: ["clearItem"] },
			"VALUE.SET": { actions: ["setValue"] },
			"INPUT_VALUE.SET": { actions: ["setInputValue"] },
			"POSITIONING.SET": { actions: ["reposition"] }
		},
		entry: SS([{
			guard: "autoFocus",
			actions: ["setInitialFocus"]
		}]),
		states: {
			closed: {
				tags: ["closed"],
				initial: "idle",
				states: {
					idle: {
						tags: ["idle"],
						entry: ["scrollContentToTop", "clearHighlightedValue"],
						on: {
							"CONTROLLED.OPEN": { target: "open.interacting" },
							"TRIGGER.CLICK": [{
								guard: "isOpenControlled",
								actions: [
									"setInitialFocus",
									"highlightFirstSelectedItem",
									"invokeOnOpen"
								]
							}, {
								target: "open.interacting",
								actions: [
									"setInitialFocus",
									"highlightFirstSelectedItem",
									"invokeOnOpen"
								]
							}],
							"INPUT.CLICK": [{
								guard: "isOpenControlled",
								actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
							}, {
								target: "open.interacting",
								actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
							}],
							"INPUT.FOCUS": { target: "focused" },
							OPEN: [{
								guard: "isOpenControlled",
								actions: ["invokeOnOpen"]
							}, {
								target: "open.interacting",
								actions: ["invokeOnOpen"]
							}],
							"VALUE.CLEAR": {
								target: "focused",
								actions: [
									"clearInputValue",
									"clearSelectedItems",
									"setInitialFocus"
								]
							}
						}
					},
					focused: {
						tags: ["focused"],
						entry: ["scrollContentToTop", "clearHighlightedValue"],
						on: {
							"CONTROLLED.OPEN": [{
								guard: "isChangeEvent",
								target: "open.suggesting"
							}, { target: "open.interacting" }],
							"INPUT.CHANGE": [
								{
									guard: CS("isOpenControlled", "openOnChange"),
									actions: [
										"setInputValue",
										"invokeOnOpen",
										"highlightFirstItemIfNeeded"
									]
								},
								{
									guard: "openOnChange",
									target: "open.suggesting",
									actions: [
										"setInputValue",
										"invokeOnOpen",
										"highlightFirstItemIfNeeded"
									]
								},
								{ actions: ["setInputValue"] }
							],
							"LAYER.INTERACT_OUTSIDE": { target: "idle" },
							"INPUT.ESCAPE": {
								guard: CS("isCustomValue", wS("allowCustomValue")),
								actions: ["revertInputValue"]
							},
							"INPUT.BLUR": { target: "idle" },
							"INPUT.CLICK": [{
								guard: "isOpenControlled",
								actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
							}, {
								target: "open.interacting",
								actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
							}],
							"TRIGGER.CLICK": [{
								guard: "isOpenControlled",
								actions: [
									"setInitialFocus",
									"highlightFirstSelectedItem",
									"invokeOnOpen"
								]
							}, {
								target: "open.interacting",
								actions: [
									"setInitialFocus",
									"highlightFirstSelectedItem",
									"invokeOnOpen"
								]
							}],
							"INPUT.ARROW_DOWN": [
								{
									guard: CS("isOpenControlled", "autoComplete"),
									actions: ["invokeOnOpen"]
								},
								{
									guard: "autoComplete",
									target: "open.interacting",
									actions: ["invokeOnOpen"]
								},
								{
									guard: "isOpenControlled",
									actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"]
								},
								{
									target: "open.interacting",
									actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"]
								}
							],
							"INPUT.ARROW_UP": [
								{
									guard: CS("isOpenControlled", "autoComplete"),
									actions: ["invokeOnOpen"]
								},
								{
									guard: "autoComplete",
									target: "open.interacting",
									actions: ["invokeOnOpen"]
								},
								{
									guard: "isOpenControlled",
									actions: ["highlightLastOrSelectedItem", "invokeOnOpen"]
								},
								{
									target: "open.interacting",
									actions: ["highlightLastOrSelectedItem", "invokeOnOpen"]
								}
							],
							OPEN: [{
								guard: "isOpenControlled",
								actions: ["invokeOnOpen"]
							}, {
								target: "open.interacting",
								actions: ["invokeOnOpen"]
							}],
							"VALUE.CLEAR": { actions: ["clearInputValue", "clearSelectedItems"] }
						}
					}
				}
			},
			open: {
				tags: ["open", "focused"],
				entry: ["setInitialFocus"],
				effects: [
					"trackFocusVisible",
					"scrollToHighlightedItem",
					"trackDismissableLayer",
					"trackPlacement",
					"trackLiveRegion"
				],
				on: {
					"CONTROLLED.CLOSE": [{
						guard: "restoreFocus",
						target: "closed.focused",
						actions: ["setFinalFocus"]
					}, { target: "closed.idle" }],
					"INPUT.ENTER": [
						{
							guard: CS("isOpenControlled", "isCustomValue", wS("hasHighlightedItem"), wS("allowCustomValue")),
							actions: ["revertInputValue", "invokeOnClose"]
						},
						{
							guard: CS("isCustomValue", wS("hasHighlightedItem"), wS("allowCustomValue")),
							target: "closed.focused",
							actions: ["revertInputValue", "invokeOnClose"]
						},
						{
							guard: CS("isOpenControlled", "closeOnSelect"),
							actions: ["selectHighlightedItem", "invokeOnClose"]
						},
						{
							guard: "closeOnSelect",
							target: "closed.focused",
							actions: [
								"selectHighlightedItem",
								"invokeOnClose",
								"setFinalFocus"
							]
						},
						{ actions: ["selectHighlightedItem"] }
					],
					"ITEM.CLICK": [
						{
							guard: CS("isOpenControlled", "closeOnSelect"),
							actions: ["selectItem", "invokeOnClose"]
						},
						{
							guard: "closeOnSelect",
							target: "closed.focused",
							actions: [
								"selectItem",
								"invokeOnClose",
								"setFinalFocus"
							]
						},
						{ actions: ["selectItem"] }
					],
					"TRIGGER.CLICK": [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose"]
					}, {
						target: "closed.focused",
						actions: ["invokeOnClose"]
					}],
					"LAYER.INTERACT_OUTSIDE": [
						{
							guard: CS("isOpenControlled", "isCustomValue", wS("allowCustomValue")),
							actions: ["revertInputValue", "invokeOnClose"]
						},
						{
							guard: CS("isCustomValue", wS("allowCustomValue")),
							target: "closed.idle",
							actions: ["revertInputValue", "invokeOnClose"]
						},
						{
							guard: "isOpenControlled",
							actions: ["invokeOnClose"]
						},
						{
							target: "closed.idle",
							actions: ["invokeOnClose"]
						}
					],
					CLOSE: [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose"]
					}, {
						target: "closed.focused",
						actions: ["invokeOnClose", "setFinalFocus"]
					}],
					"VALUE.CLEAR": [{
						guard: "isOpenControlled",
						actions: [
							"clearInputValue",
							"clearSelectedItems",
							"invokeOnClose"
						]
					}, {
						target: "closed.focused",
						actions: [
							"clearInputValue",
							"clearSelectedItems",
							"invokeOnClose",
							"setFinalFocus"
						]
					}]
				},
				initial: "interacting",
				states: {
					interacting: { on: {
						CHILDREN_CHANGE: [{
							guard: "isHighlightedItemRemoved",
							actions: ["clearHighlightedValue"]
						}, { actions: ["scrollToHighlightedItem"] }],
						"INPUT.HOME": { actions: ["highlightFirstItem"] },
						"INPUT.END": { actions: ["highlightLastItem"] },
						"INPUT.ARROW_DOWN": [{
							guard: CS("autoComplete", "isLastItemHighlighted"),
							actions: ["clearHighlightedValue", "scrollContentToTop"]
						}, { actions: ["highlightNextItem"] }],
						"INPUT.ARROW_UP": [{
							guard: CS("autoComplete", "isFirstItemHighlighted"),
							actions: ["clearHighlightedValue"]
						}, { actions: ["highlightPrevItem"] }],
						"INPUT.CHANGE": [{
							guard: "autoComplete",
							target: "suggesting",
							actions: ["setInputValue"]
						}, {
							target: "suggesting",
							actions: ["clearHighlightedValue", "setInputValue"]
						}],
						"ITEM.POINTER_MOVE": { actions: ["setHighlightedValue"] },
						"ITEM.POINTER_LEAVE": { actions: ["clearHighlightedValue"] },
						"LAYER.ESCAPE": [
							{
								guard: CS("isOpenControlled", "autoComplete"),
								actions: ["syncInputValue", "invokeOnClose"]
							},
							{
								guard: "autoComplete",
								target: "closed.focused",
								actions: ["syncInputValue", "invokeOnClose"]
							},
							{
								guard: "isOpenControlled",
								actions: ["invokeOnClose"]
							},
							{
								target: "closed.focused",
								actions: ["invokeOnClose", "setFinalFocus"]
							}
						]
					} },
					suggesting: { on: {
						CHILDREN_CHANGE: [
							{
								guard: CS("isHighlightedItemRemoved", "hasCollectionItems", "autoHighlight"),
								actions: ["clearHighlightedValue", "highlightFirstItem"]
							},
							{
								guard: "isHighlightedItemRemoved",
								actions: ["clearHighlightedValue"]
							},
							{
								guard: "autoHighlight",
								actions: ["highlightFirstItem"]
							}
						],
						"INPUT.ARROW_DOWN": {
							target: "interacting",
							actions: ["highlightNextItem"]
						},
						"INPUT.ARROW_UP": {
							target: "interacting",
							actions: ["highlightPrevItem"]
						},
						"INPUT.HOME": {
							target: "interacting",
							actions: ["highlightFirstItem"]
						},
						"INPUT.END": {
							target: "interacting",
							actions: ["highlightLastItem"]
						},
						"INPUT.CHANGE": { actions: ["setInputValue"] },
						"LAYER.ESCAPE": [{
							guard: "isOpenControlled",
							actions: ["invokeOnClose"]
						}, {
							target: "closed.focused",
							actions: ["invokeOnClose"]
						}],
						"ITEM.POINTER_MOVE": {
							target: "interacting",
							actions: ["setHighlightedValue"]
						},
						"ITEM.POINTER_LEAVE": { actions: ["clearHighlightedValue"] }
					} }
				}
			}
		},
		implementations: {
			guards: {
				isInputValueEmpty: ({ computed: e }) => e("isInputValueEmpty"),
				autoComplete: ({ computed: e, prop: t }) => e("autoComplete") && !t("multiple"),
				autoHighlight: ({ computed: e }) => e("autoHighlight"),
				isFirstItemHighlighted: ({ prop: e, context: t }) => e("collection").firstValue === t.get("highlightedValue"),
				isLastItemHighlighted: ({ prop: e, context: t }) => e("collection").lastValue === t.get("highlightedValue"),
				isCustomValue: ({ computed: e }) => e("isCustomValue"),
				allowCustomValue: ({ prop: e }) => !!e("allowCustomValue"),
				hasHighlightedItem: ({ context: e }) => e.get("highlightedValue") != null,
				closeOnSelect: ({ prop: e }) => !!e("closeOnSelect"),
				isOpenControlled: ({ prop: e }) => e("open") != null,
				openOnChange: ({ prop: e, context: t }) => {
					let n = e("openOnChange");
					return ef(n) ? n : !!n?.({ inputValue: t.get("inputValue") });
				},
				restoreFocus: ({ event: e }) => {
					let t = e.restoreFocus ?? e.previousEvent?.restoreFocus;
					return t == null || !!t;
				},
				isChangeEvent: ({ event: e }) => e.previousEvent?.type === "INPUT.CHANGE",
				autoFocus: ({ prop: e }) => !!e("autoFocus"),
				isHighlightedItemRemoved: ({ prop: e, context: t }) => !e("collection").has(t.get("highlightedValue")),
				hasCollectionItems: ({ prop: e }) => e("collection").size > 0
			},
			effects: {
				trackFocusVisible({ scope: e }) {
					return kh({ root: e.getRootNode?.() });
				},
				trackDismissableLayer({ send: e, prop: t, scope: n }) {
					return t("disableLayer") ? void 0 : sx(() => nS(n), {
						type: "listbox",
						defer: !0,
						exclude: () => [
							rS(n),
							oS(n),
							sS(n)
						],
						onFocusOutside: t("onFocusOutside"),
						onPointerDownOutside: t("onPointerDownOutside"),
						onInteractOutside: t("onInteractOutside"),
						onEscapeKeyDown(t) {
							t.preventDefault(), t.stopPropagation(), e({
								type: "LAYER.ESCAPE",
								src: "escape-key"
							});
						},
						onDismiss() {
							e({
								type: "LAYER.INTERACT_OUTSIDE",
								src: "interact-outside",
								restoreFocus: !1
							});
						}
					});
				},
				trackLiveRegion({ refs: e, scope: t }) {
					let n = mS({
						level: "assertive",
						document: t.getDoc()
					});
					return e.set("liveRegion", n), () => n.destroy();
				},
				trackPlacement({ context: e, prop: t, scope: n }) {
					return e.set("currentPlacement", t("positioning").placement), Qy(() => aS(n) || oS(n), () => iS(n), {
						...t("positioning"),
						defer: !0,
						onComplete(t) {
							e.set("currentPlacement", t.placement);
						}
					});
				},
				scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
					let r = rS(n), i = [], a = (r) => {
						if (Eh() === "pointer") return;
						let a = e.get("highlightedValue");
						if (!a) return;
						let o = nS(n), s = t("scrollToIndexFn");
						if (s) {
							s({
								index: t("collection").indexOf(a),
								immediate: r,
								getElement: () => cS(n, a)
							});
							return;
						}
						let c = cS(n, a), l = J(() => {
							dd(c, {
								rootEl: o,
								block: "nearest"
							});
						});
						i.push(l);
					}, o = J(() => {
						Dh("virtual"), a(!0);
					});
					i.push(o);
					let s = Cu(r, {
						attributes: ["aria-activedescendant"],
						callback: () => a(!1)
					});
					return i.push(s), () => {
						i.forEach((e) => e());
					};
				}
			},
			actions: {
				reposition({ context: e, prop: t, scope: n, event: r }) {
					Qy(() => aS(n), () => iS(n), {
						...t("positioning"),
						...r.options,
						defer: !0,
						listeners: !1,
						onComplete(t) {
							e.set("currentPlacement", t.placement);
						}
					});
				},
				setHighlightedValue({ context: e, event: t }) {
					t.value != null && e.set("highlightedValue", t.value);
				},
				clearHighlightedValue({ context: e }) {
					e.set("highlightedValue", null);
				},
				selectHighlightedItem(e) {
					let { context: t, prop: n } = e, r = n("collection"), i = t.get("highlightedValue");
					if (!i || !r.has(i)) return;
					let a = n("multiple") ? qd(t.get("value"), i) : [i];
					n("onSelect")?.({
						value: a,
						itemValue: i
					}), t.set("value", a);
					let o = gf(n("selectionBehavior"), {
						preserve: t.get("inputValue"),
						replace: r.stringifyMany(a),
						clear: ""
					});
					t.set("inputValue", o);
				},
				scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
					vu(() => {
						let r = e.get("highlightedValue");
						if (r == null) return;
						let i = cS(n, r), a = nS(n), o = t("scrollToIndexFn");
						if (o) {
							o({
								index: t("collection").indexOf(r),
								immediate: !0,
								getElement: () => cS(n, r)
							});
							return;
						}
						dd(i, {
							rootEl: a,
							block: "nearest"
						});
					});
				},
				selectItem(e) {
					let { context: t, event: n, flush: r, prop: i } = e;
					n.value != null && r(() => {
						let e = i("multiple") ? qd(t.get("value"), n.value) : [n.value];
						i("onSelect")?.({
							value: e,
							itemValue: n.value
						}), t.set("value", e);
						let r = gf(i("selectionBehavior"), {
							preserve: t.get("inputValue"),
							replace: i("collection").stringifyMany(e),
							clear: ""
						});
						t.set("inputValue", r);
					});
				},
				clearItem(e) {
					let { context: t, event: n, flush: r, prop: i } = e;
					n.value != null && r(() => {
						let e = Wd(t.get("value"), n.value);
						t.set("value", e);
						let r = gf(i("selectionBehavior"), {
							preserve: t.get("inputValue"),
							replace: i("collection").stringifyMany(e),
							clear: ""
						});
						t.set("inputValue", r);
					});
				},
				setInitialFocus({ scope: e }) {
					J(() => {
						lS(e);
					});
				},
				setFinalFocus({ scope: e }) {
					J(() => {
						oS(e)?.dataset.focusable == null ? lS(e) : uS(e);
					});
				},
				syncInputValue({ context: e, scope: t, event: n }) {
					let r = rS(t);
					r && (r.value = e.get("inputValue"), queueMicrotask(() => {
						n.current().type !== "INPUT.CHANGE" && _c(r);
					}));
				},
				setInputValue({ context: e, event: t }) {
					e.set("inputValue", t.value);
				},
				clearInputValue({ context: e }) {
					e.set("inputValue", "");
				},
				revertInputValue({ context: e, prop: t, computed: n }) {
					let r = gf(t("selectionBehavior"), {
						replace: n("hasSelectedItems") ? n("valueAsString") : "",
						preserve: e.get("inputValue"),
						clear: ""
					});
					e.set("inputValue", r);
				},
				setValue(e) {
					let { context: t, flush: n, event: r, prop: i } = e;
					n(() => {
						t.set("value", r.value);
						let e = gf(i("selectionBehavior"), {
							preserve: t.get("inputValue"),
							replace: i("collection").stringifyMany(r.value),
							clear: ""
						});
						t.set("inputValue", e);
					});
				},
				clearSelectedItems(e) {
					let { context: t, flush: n, prop: r } = e;
					n(() => {
						t.set("value", []);
						let e = gf(r("selectionBehavior"), {
							preserve: t.get("inputValue"),
							replace: r("collection").stringifyMany([]),
							clear: ""
						});
						t.set("inputValue", e);
					});
				},
				scrollContentToTop({ prop: e, scope: t }) {
					let n = e("scrollToIndexFn");
					if (n) {
						let r = e("collection").firstValue;
						n({
							index: 0,
							immediate: !0,
							getElement: () => cS(t, r)
						});
					} else {
						let e = nS(t);
						if (!e) return;
						e.scrollTop = 0;
					}
				},
				invokeOnOpen({ prop: e, event: t, context: n }) {
					let r = yS(t);
					e("onOpenChange")?.({
						open: !0,
						reason: r,
						value: n.get("value")
					});
				},
				invokeOnClose({ prop: e, event: t, context: n }) {
					let r = yS(t);
					e("onOpenChange")?.({
						open: !1,
						reason: r,
						value: n.get("value")
					});
				},
				highlightFirstItem({ context: e, prop: t, scope: n }) {
					(nS(n) ? queueMicrotask : J)(() => {
						let n = t("collection").firstValue;
						n && e.set("highlightedValue", n);
					});
				},
				highlightFirstItemIfNeeded({ computed: e, action: t }) {
					e("autoHighlight") && t(["highlightFirstItem"]);
				},
				highlightLastItem({ context: e, prop: t, scope: n }) {
					(nS(n) ? queueMicrotask : J)(() => {
						let n = t("collection").lastValue;
						n && e.set("highlightedValue", n);
					});
				},
				highlightNextItem({ context: e, prop: t }) {
					let n = null, r = e.get("highlightedValue"), i = t("collection");
					r ? (n = i.getNextValue(r), !n && t("loopFocus") && (n = i.firstValue)) : n = i.firstValue, n && e.set("highlightedValue", n);
				},
				highlightPrevItem({ context: e, prop: t }) {
					let n = null, r = e.get("highlightedValue"), i = t("collection");
					r ? (n = i.getPreviousValue(r), !n && t("loopFocus") && (n = i.lastValue)) : n = i.lastValue, n && e.set("highlightedValue", n);
				},
				highlightFirstSelectedItem({ context: e, prop: t }) {
					J(() => {
						let [n] = t("collection").sort(e.get("value"));
						n && e.set("highlightedValue", n);
					});
				},
				highlightFirstOrSelectedItem({ context: e, prop: t, computed: n }) {
					J(() => {
						let r = null;
						r = n("hasSelectedItems") ? t("collection").sort(e.get("value"))[0] : t("collection").firstValue, r && e.set("highlightedValue", r);
					});
				},
				highlightLastOrSelectedItem({ context: e, prop: t, computed: n }) {
					J(() => {
						let r = t("collection"), i = null;
						i = n("hasSelectedItems") ? r.sort(e.get("value"))[0] : r.lastValue, i && e.set("highlightedValue", i);
					});
				},
				autofillInputValue({ context: e, computed: t, prop: n, event: r, scope: i }) {
					let a = rS(i), o = n("collection");
					if (!t("autoComplete") || !a || !r.keypress) return;
					let s = o.stringify(e.get("highlightedValue"));
					J(() => {
						a.value = s || e.get("inputValue");
					});
				},
				syncSelectedItems(e) {
					queueMicrotask(() => {
						let { context: t, prop: n } = e, r = n("collection"), i = t.get("value"), a = Hg({
							values: i,
							collection: r,
							selectedItemMap: t.get("selectedItemMap")
						});
						t.set("selectedItemMap", a.nextSelectedItemMap);
						let o = gf(n("selectionBehavior"), {
							preserve: t.get("inputValue"),
							replace: r.stringifyMany(i),
							clear: ""
						});
						t.set("inputValue", o);
					});
				},
				syncHighlightedItem({ context: e, prop: t }) {
					let n = t("collection").find(e.get("highlightedValue"));
					e.set("highlightedItem", n);
				},
				announceHighlightedItem({ context: e, prop: t, refs: n }) {
					if (!hl()) return;
					let r = e.get("highlightedValue"), i = r ? t("collection").stringifyItem(t("collection").find(r)) : null;
					if (!i) return;
					let a = r ? e.get("value").includes(r) : !1;
					n.get("liveRegion")?.announce(a ? `${i}, selected` : i);
				},
				toggleVisibility({ event: e, send: t, prop: n }) {
					t({
						type: n("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
						previousEvent: e
					});
				}
			}
		}
	});
})), DS = t((() => {})), OS = t((() => {
	Wx(), pS(), ES(), DS();
})), kS, Q, AS = t((() => {
	lc(), kS = ac("date-picker").parts("clearTrigger", "content", "control", "input", "label", "monthSelect", "nextTrigger", "positioner", "presetTrigger", "prevTrigger", "rangeText", "root", "table", "tableBody", "tableCell", "tableCellTrigger", "tableHead", "tableHeader", "tableRow", "trigger", "view", "viewControl", "viewTrigger", "yearSelect"), Q = kS.build();
}));
//#endregion
//#region node_modules/.pnpm/@internationalized+date@3.12.2/node_modules/@internationalized/date/dist/private/utils.mjs
function jS(e, t) {
	return e - t * Math.floor(e / t);
}
var MS = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@internationalized+date@3.12.2/node_modules/@internationalized/date/dist/private/calendars/GregorianCalendar.mjs
function NS(e, t, n, r) {
	t = FS(e, t);
	let i = t - 1, a = -2;
	return n <= 2 ? a = 0 : PS(t) && (a = -1), LS - 1 + 365 * i + Math.floor(i / 4) - Math.floor(i / 100) + Math.floor(i / 400) + Math.floor((367 * n - 362) / 12 + a + r);
}
function PS(e) {
	return e % 4 == 0 && (e % 100 != 0 || e % 400 == 0);
}
function FS(e, t) {
	return e === "BC" ? 1 - t : t;
}
function IS(e) {
	let t = "AD";
	return e <= 0 && (t = "BC", e = 1 - e), [t, e];
}
var LS, RS, zS, BS = t((() => {
	Ew(), MS(), LS = 1721426, RS = {
		standard: [
			31,
			28,
			31,
			30,
			31,
			30,
			31,
			31,
			30,
			31,
			30,
			31
		],
		leapyear: [
			31,
			29,
			31,
			30,
			31,
			30,
			31,
			31,
			30,
			31,
			30,
			31
		]
	}, zS = class {
		fromJulianDay(e) {
			let t = e, n = t - LS, r = Math.floor(n / 146097), i = jS(n, 146097), a = Math.floor(i / 36524), o = jS(i, 36524), s = Math.floor(o / 1461), c = jS(o, 1461), l = Math.floor(c / 365), [u, d] = IS(r * 400 + a * 100 + s * 4 + l + +(a !== 4 && l !== 4)), f = t - NS(u, d, 1, 1), p = 2;
			t < NS(u, d, 3, 1) ? p = 0 : PS(d) && (p = 1);
			let m = Math.floor(((f + p) * 12 + 373) / 367);
			return new Cw(u, d, m, t - NS(u, d, m, 1) + 1);
		}
		toJulianDay(e) {
			return NS(e.era, e.year, e.month, e.day);
		}
		getDaysInMonth(e) {
			return RS[PS(e.year) ? "leapyear" : "standard"][e.month - 1];
		}
		getMonthsInYear(e) {
			return 12;
		}
		getDaysInYear(e) {
			return PS(e.year) ? 366 : 365;
		}
		getMaximumMonthsInYear() {
			return 12;
		}
		getMaximumDaysInMonth() {
			return 31;
		}
		getYearsInEra(e) {
			return 9999;
		}
		getEras() {
			return ["BC", "AD"];
		}
		isInverseEra(e) {
			return e.era === "BC";
		}
		balanceDate(e) {
			e.year <= 0 && (e.era = e.era === "BC" ? "AD" : "BC", e.year = 1 - e.year);
		}
		constructor() {
			this.identifier = "gregory";
		}
	};
})), VS, HS = t((() => {
	VS = {
		"001": 1,
		AD: 1,
		AE: 6,
		AF: 6,
		AI: 1,
		AL: 1,
		AM: 1,
		AN: 1,
		AR: 1,
		AT: 1,
		AU: 1,
		AX: 1,
		AZ: 1,
		BA: 1,
		BE: 1,
		BG: 1,
		BH: 6,
		BM: 1,
		BN: 1,
		BY: 1,
		CH: 1,
		CL: 1,
		CM: 1,
		CN: 1,
		CR: 1,
		CY: 1,
		CZ: 1,
		DE: 1,
		DJ: 6,
		DK: 1,
		DZ: 6,
		EC: 1,
		EE: 1,
		EG: 6,
		ES: 1,
		FI: 1,
		FJ: 1,
		FO: 1,
		FR: 1,
		GB: 1,
		GE: 1,
		GF: 1,
		GP: 1,
		GR: 1,
		HR: 1,
		HU: 1,
		IE: 1,
		IQ: 6,
		IR: 6,
		IS: 1,
		IT: 1,
		JO: 6,
		KG: 1,
		KW: 6,
		KZ: 1,
		LB: 1,
		LI: 1,
		LK: 1,
		LT: 1,
		LU: 1,
		LV: 1,
		LY: 6,
		MC: 1,
		MD: 1,
		ME: 1,
		MK: 1,
		MN: 1,
		MQ: 1,
		MV: 5,
		MY: 1,
		NL: 1,
		NO: 1,
		NZ: 1,
		OM: 6,
		PL: 1,
		QA: 6,
		RE: 1,
		RO: 1,
		RS: 1,
		RU: 1,
		SD: 6,
		SE: 1,
		SI: 1,
		SK: 1,
		SM: 1,
		SY: 6,
		TJ: 1,
		TM: 1,
		TR: 1,
		UA: 1,
		UY: 1,
		UZ: 1,
		VA: 1,
		VN: 1,
		XK: 1
	};
}));
//#endregion
//#region node_modules/.pnpm/@internationalized+date@3.12.2/node_modules/@internationalized/date/dist/private/queries.mjs
function US(e, t) {
	return t = FC(t, e.calendar), e.era === t.era && e.year === t.year && e.month === t.month && e.day === t.day;
}
function WS(e, t) {
	return t = FC(t, e.calendar), e = aC(e), t = aC(t), e.era === t.era && e.year === t.year && e.month === t.month;
}
function GS(e, t) {
	return t = FC(t, e.calendar), e = sC(e), t = sC(t), e.era === t.era && e.year === t.year;
}
function KS(e, t) {
	return YS(e.calendar, t.calendar) && US(e, t);
}
function qS(e, t) {
	return YS(e.calendar, t.calendar) && WS(e, t);
}
function JS(e, t) {
	return YS(e.calendar, t.calendar) && GS(e, t);
}
function YS(e, t) {
	return e.isEqual?.(t) ?? t.isEqual?.(e) ?? e.identifier === t.identifier;
}
function XS(e, t) {
	return US(e, $S(t));
}
function ZS(e, t, n) {
	let r = e.calendar.toJulianDay(e), i = n ? _C[n] : fC(t), a = Math.ceil(r + 1 - i) % 7;
	return a < 0 && (a += 7), a;
}
function QS(e) {
	return MC(Date.now(), e);
}
function $S(e) {
	return NC(QS(e));
}
function eC(e, t) {
	return e.calendar.toJulianDay(e) - t.calendar.toJulianDay(t);
}
function tC(e, t) {
	return nC(e) - nC(t);
}
function nC(e) {
	return e.hour * 36e5 + e.minute * 6e4 + e.second * 1e3 + e.millisecond;
}
function rC() {
	return vC ??= new Intl.DateTimeFormat().resolvedOptions().timeZone, vC;
}
function iC() {
	return yC;
}
function aC(e) {
	return e.subtract({ days: e.day - 1 });
}
function oC(e) {
	return e.add({ days: e.calendar.getDaysInMonth(e) - e.day });
}
function sC(e) {
	return aC(e.subtract({ months: e.month - 1 }));
}
function cC(e) {
	return oC(e.add({ months: e.calendar.getMonthsInYear(e) - e.month }));
}
function lC(e, t, n) {
	let r = ZS(e, t, n);
	return e.subtract({ days: r });
}
function uC(e, t, n) {
	return lC(e, t, n).add({ days: 6 });
}
function dC(e) {
	if (Intl.Locale) {
		let t = bC.get(e);
		return t || (t = new Intl.Locale(e).maximize().region, t && bC.set(e, t)), t;
	}
	let t = e.split("-")[1];
	return t === "u" ? void 0 : t;
}
function fC(e) {
	let t = xC.get(e);
	if (!t) {
		if (Intl.Locale) {
			let n = new Intl.Locale(e);
			if ("getWeekInfo" in n && (t = n.getWeekInfo(), t)) return xC.set(e, t), t.firstDay;
		}
		let n = dC(e);
		if (e.includes("-fw-")) {
			let n = e.split("-fw-")[1].split("-")[0];
			t = n === "mon" ? { firstDay: 1 } : n === "tue" ? { firstDay: 2 } : n === "wed" ? { firstDay: 3 } : n === "thu" ? { firstDay: 4 } : n === "fri" ? { firstDay: 5 } : n === "sat" ? { firstDay: 6 } : { firstDay: 0 };
		} else t = e.includes("-ca-iso8601") ? { firstDay: 1 } : { firstDay: n && VS[n] || 0 };
		xC.set(e, t);
	}
	return t.firstDay;
}
function pC(e, t, n) {
	let r = e.calendar.getDaysInMonth(e);
	return Math.ceil((ZS(aC(e), t, n) + r) / 7);
}
function mC(e, t) {
	return e && t ? e.compare(t) <= 0 ? e : t : e || t;
}
function hC(e, t) {
	return e && t ? e.compare(t) >= 0 ? e : t : e || t;
}
function gC(e, t) {
	let n = e.calendar.toJulianDay(e), r = Math.ceil(n + 1) % 7;
	r < 0 && (r += 7);
	let i = dC(t), [a, o] = SC[i] || [6, 0];
	return r === a || r === o;
}
var _C, vC, yC, bC, xC, SC, CC = t((() => {
	VC(), HS(), _C = {
		sun: 0,
		mon: 1,
		tue: 2,
		wed: 3,
		thu: 4,
		fri: 5,
		sat: 6
	}, vC = null, yC = !1, bC = /* @__PURE__ */ new Map(), xC = /* @__PURE__ */ new Map(), SC = {
		AF: [4, 5],
		AE: [5, 6],
		BH: [5, 6],
		DZ: [5, 6],
		EG: [5, 6],
		IL: [5, 6],
		IQ: [5, 6],
		IR: [5, 5],
		JO: [5, 6],
		KW: [5, 6],
		LY: [5, 6],
		OM: [5, 6],
		QA: [5, 6],
		SA: [5, 6],
		SD: [5, 6],
		SY: [5, 6],
		YE: [5, 6]
	};
}));
//#endregion
//#region node_modules/.pnpm/@internationalized+date@3.12.2/node_modules/@internationalized/date/dist/private/conversion.mjs
function wC(e) {
	return e = FC(e, new zS()), TC(FS(e.era, e.year), e.month, e.day, e.hour, e.minute, e.second, e.millisecond);
}
function TC(e, t, n, r, i, a, o) {
	let s = /* @__PURE__ */ new Date();
	return s.setUTCHours(r, i, a, o), s.setUTCFullYear(e, t - 1, n), s.getTime();
}
function EC(e, t) {
	if (t === "UTC") return 0;
	if (e > 0 && t === rC() && !iC()) return new Date(e).getTimezoneOffset() * -6e4;
	let { year: n, month: r, day: i, hour: a, minute: o, second: s } = DC(e, t);
	return TC(n, r, i, a, o, s, 0) - Math.floor(e / 1e3) * 1e3;
}
function DC(e, t) {
	let n = zC.get(t);
	n || (n = new Intl.DateTimeFormat("en-US", {
		timeZone: t,
		hour12: !1,
		era: "short",
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric"
	}), zC.set(t, n));
	let r = n.formatToParts(new Date(e)), i = {};
	for (let e of r) e.type !== "literal" && (i[e.type] = e.value);
	return {
		year: i.era === "BC" || i.era === "B" ? -i.year + 1 : +i.year,
		month: +i.month,
		day: +i.day,
		hour: i.hour === "24" ? 0 : +i.hour,
		minute: +i.minute,
		second: +i.second
	};
}
function OC(e, t, n, r) {
	return (n === r ? [n] : [n, r]).filter((n) => kC(e, t, n));
}
function kC(e, t, n) {
	let r = DC(n, t);
	return e.year === r.year && e.month === r.month && e.day === r.day && e.hour === r.hour && e.minute === r.minute && e.second === r.second;
}
function AC(e, t, n = "compatible") {
	let r = PC(e);
	if (t === "UTC") return wC(r);
	if (t === rC() && n === "compatible" && !iC()) {
		r = FC(r, new zS());
		let e = /* @__PURE__ */ new Date(), t = FS(r.era, r.year);
		return e.setFullYear(t, r.month - 1, r.day), e.setHours(r.hour, r.minute, r.second, r.millisecond), e.getTime();
	}
	let i = wC(r), a = EC(i - BC, t), o = EC(i + BC, t), s = OC(r, t, i - a, i - o);
	if (s.length === 1) return s[0];
	if (s.length > 1) switch (n) {
		case "compatible":
		case "earlier": return s[0];
		case "later": return s[s.length - 1];
		case "reject": throw RangeError("Multiple possible absolute times found");
	}
	switch (n) {
		case "earlier": return Math.min(i - a, i - o);
		case "compatible":
		case "later": return Math.max(i - a, i - o);
		case "reject": throw RangeError("No such absolute time found");
	}
}
function jC(e, t, n = "compatible") {
	return new Date(AC(e, t, n));
}
function MC(e, t) {
	let n = EC(e, t), r = new Date(e + n), i = r.getUTCFullYear(), a = r.getUTCMonth() + 1, o = r.getUTCDate(), s = r.getUTCHours(), c = r.getUTCMinutes(), l = r.getUTCSeconds(), u = r.getUTCMilliseconds();
	return new Tw(i < 1 ? "BC" : "AD", i < 1 ? -i + 1 : i, a, o, t, n, s, c, l, u);
}
function NC(e) {
	return new Cw(e.calendar, e.era, e.year, e.month, e.day);
}
function PC(e, t) {
	let n = 0, r = 0, i = 0, a = 0;
	if ("timeZone" in e) ({hour: n, minute: r, second: i, millisecond: a} = e);
	else if ("hour" in e && !t) return e;
	return t && ({hour: n, minute: r, second: i, millisecond: a} = t), new ww(e.calendar, e.era, e.year, e.month, e.day, n, r, i, a);
}
function FC(e, t) {
	if (YS(e.calendar, t)) return e;
	let n = t.fromJulianDay(e.calendar.toJulianDay(e)), r = e.copy();
	return r.calendar = t, r.era = n.era, r.year = n.year, r.month = n.month, r.day = n.day, qC(r), r;
}
function IC(e, t, n) {
	return e instanceof Tw ? e.timeZone === t ? e : RC(e, t) : MC(AC(e, t, n), t);
}
function LC(e) {
	let t = wC(e) - e.offset;
	return new Date(t);
}
function RC(e, t) {
	return FC(MC(wC(e) - e.offset, t), e.calendar);
}
var zC, BC, VC = t((() => {
	Ew(), uw(), BS(), CC(), zC = /* @__PURE__ */ new Map(), BC = 864e5;
}));
//#endregion
//#region node_modules/.pnpm/@internationalized+date@3.12.2/node_modules/@internationalized/date/dist/private/manipulation.mjs
function HC(e, t) {
	let n = e.copy(), r = "hour" in n ? tw(n, t) : 0;
	UC(n, t.years || 0), n.calendar.balanceYearMonth && n.calendar.balanceYearMonth(n, e), n.month += t.months || 0, WC(n), KC(n), n.day += (t.weeks || 0) * 7, n.day += t.days || 0, n.day += r, GC(n), n.calendar.balanceDate && n.calendar.balanceDate(n), n.year < 1 && (n.year = 1, n.month = 1, n.day = 1);
	let i = n.calendar.getYearsInEra(n);
	if (n.year > i) {
		let e = n.calendar.isInverseEra?.(n);
		n.year = i, n.month = e ? 1 : n.calendar.getMonthsInYear(n), n.day = e ? 1 : n.calendar.getDaysInMonth(n);
	}
	n.month < 1 && (n.month = 1, n.day = 1);
	let a = n.calendar.getMonthsInYear(n);
	return n.month > a && (n.month = a, n.day = n.calendar.getDaysInMonth(n)), n.day = Math.max(1, Math.min(n.calendar.getDaysInMonth(n), n.day)), n;
}
function UC(e, t) {
	e.calendar.isInverseEra?.(e) && (t = -t), e.year += t;
}
function WC(e) {
	for (; e.month < 1;) UC(e, -1), e.month += e.calendar.getMonthsInYear(e);
	let t = 0;
	for (; e.month > (t = e.calendar.getMonthsInYear(e));) e.month -= t, UC(e, 1);
}
function GC(e) {
	for (; e.day < 1;) e.month--, WC(e), e.day += e.calendar.getDaysInMonth(e);
	for (; e.day > e.calendar.getDaysInMonth(e);) e.day -= e.calendar.getDaysInMonth(e), e.month++, WC(e);
}
function KC(e) {
	e.month = Math.max(1, Math.min(e.calendar.getMonthsInYear(e), e.month)), e.day = Math.max(1, Math.min(e.calendar.getDaysInMonth(e), e.day));
}
function qC(e) {
	e.calendar.constrainDate && e.calendar.constrainDate(e), e.year = Math.max(1, Math.min(e.calendar.getYearsInEra(e), e.year)), KC(e);
}
function JC(e) {
	let t = {};
	for (let n in e) typeof e[n] == "number" && (t[n] = -e[n]);
	return t;
}
function YC(e, t) {
	return HC(e, JC(t));
}
function XC(e, t) {
	let n = e.copy();
	return t.era != null && (n.era = t.era), t.year != null && (n.year = t.year), t.month != null && (n.month = t.month), t.day != null && (n.day = t.day), qC(n), n;
}
function ZC(e, t) {
	let n = e.copy();
	return t.hour != null && (n.hour = t.hour), t.minute != null && (n.minute = t.minute), t.second != null && (n.second = t.second), t.millisecond != null && (n.millisecond = t.millisecond), $C(n), n;
}
function QC(e) {
	e.second += Math.floor(e.millisecond / 1e3), e.millisecond = ew(e.millisecond, 1e3), e.minute += Math.floor(e.second / 60), e.second = ew(e.second, 60), e.hour += Math.floor(e.minute / 60), e.minute = ew(e.minute, 60);
	let t = Math.floor(e.hour / 24);
	return e.hour = ew(e.hour, 24), t;
}
function $C(e) {
	e.millisecond = Math.max(0, Math.min(e.millisecond, 1e3)), e.second = Math.max(0, Math.min(e.second, 59)), e.minute = Math.max(0, Math.min(e.minute, 59)), e.hour = Math.max(0, Math.min(e.hour, 23));
}
function ew(e, t) {
	let n = e % t;
	return n < 0 && (n += t), n;
}
function tw(e, t) {
	return e.hour += t.hours || 0, e.minute += t.minutes || 0, e.second += t.seconds || 0, e.millisecond += t.milliseconds || 0, QC(e);
}
function nw(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "era": {
			let t = e.calendar.getEras(), a = t.indexOf(e.era);
			if (a < 0) throw Error("Invalid era: " + e.era);
			a = iw(a, n, 0, t.length - 1, r?.round), i.era = t[a], qC(i);
			break;
		}
		case "year":
			i.calendar.isInverseEra?.(i) && (n = -n), i.year = iw(e.year, n, -Infinity, 9999, r?.round), i.year === -Infinity && (i.year = 1), i.calendar.balanceYearMonth && i.calendar.balanceYearMonth(i, e);
			break;
		case "month":
			i.month = iw(e.month, n, 1, e.calendar.getMonthsInYear(e), r?.round);
			break;
		case "day":
			i.day = iw(e.day, n, 1, e.calendar.getDaysInMonth(e), r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return e.calendar.balanceDate && e.calendar.balanceDate(i), qC(i), i;
}
function rw(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "hour": {
			let t = e.hour, a = 0, o = 23;
			if (r?.hourCycle === 12) {
				let e = t >= 12;
				a = e ? 12 : 0, o = e ? 23 : 11;
			}
			i.hour = iw(t, n, a, o, r?.round);
			break;
		}
		case "minute":
			i.minute = iw(e.minute, n, 0, 59, r?.round);
			break;
		case "second":
			i.second = iw(e.second, n, 0, 59, r?.round);
			break;
		case "millisecond":
			i.millisecond = iw(e.millisecond, n, 0, 999, r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return i;
}
function iw(e, t, n, r, i = !1) {
	if (i) {
		e += Math.sign(t), e < n && (e = r);
		let i = Math.abs(t);
		e = t > 0 ? Math.ceil(e / i) * i : Math.floor(e / i) * i, e > r && (e = n);
	} else e += t, e < n ? e = r - (n - e - 1) : e > r && (e = n + (e - r - 1));
	return e;
}
function aw(e, t) {
	let n;
	return n = t.years != null && t.years !== 0 || t.months != null && t.months !== 0 || t.weeks != null && t.weeks !== 0 || t.days != null && t.days !== 0 ? AC(HC(PC(e), {
		years: t.years,
		months: t.months,
		weeks: t.weeks,
		days: t.days
	}), e.timeZone) : wC(e) - e.offset, n += t.milliseconds || 0, n += (t.seconds || 0) * 1e3, n += (t.minutes || 0) * 6e4, n += (t.hours || 0) * 36e5, FC(MC(n, e.timeZone), e.calendar);
}
function ow(e, t) {
	return aw(e, JC(t));
}
function sw(e, t, n, r) {
	switch (t) {
		case "hour": {
			let t = 0, i = 23;
			if (r?.hourCycle === 12) {
				let n = e.hour >= 12;
				t = n ? 12 : 0, i = n ? 23 : 11;
			}
			let a = PC(e), o = FC(ZC(a, { hour: t }), new zS()), s = [AC(o, e.timeZone, "earlier"), AC(o, e.timeZone, "later")].filter((t) => MC(t, e.timeZone).day === o.day)[0], c = FC(ZC(a, { hour: i }), new zS()), l = [AC(c, e.timeZone, "earlier"), AC(c, e.timeZone, "later")].filter((t) => MC(t, e.timeZone).day === c.day).pop(), u = wC(e) - e.offset, d = Math.floor(u / lw), f = u % lw;
			return u = iw(d, n, Math.floor(s / lw), Math.floor(l / lw), r?.round) * lw + f, FC(MC(u, e.timeZone), e.calendar);
		}
		case "minute":
		case "second":
		case "millisecond": return rw(e, t, n, r);
		case "era":
		case "year":
		case "month":
		case "day": return FC(MC(AC(nw(PC(e), t, n, r), e.timeZone), e.timeZone), e.calendar);
		default: throw Error("Unsupported field " + t);
	}
}
function cw(e, t, n) {
	let r = PC(e), i = ZC(XC(r, t), t);
	return i.compare(r) === 0 ? e : FC(MC(AC(i, e.timeZone, n), e.timeZone), e.calendar);
}
var lw, uw = t((() => {
	VC(), BS(), lw = 36e5;
}));
//#endregion
//#region node_modules/.pnpm/@internationalized+date@3.12.2/node_modules/@internationalized/date/dist/private/string.mjs
function dw(e) {
	let t = e.match(vw);
	if (!t) throw yw.test(e) ? Error(`Invalid ISO 8601 date string: ${e}. Use parseAbsolute() instead.`) : Error("Invalid ISO 8601 date string: " + e);
	let n = new Cw(fw(t[1], 0, 9999), fw(t[2], 1, 12), 1);
	return n.day = fw(t[3], 1, n.calendar.getDaysInMonth(n)), n;
}
function fw(e, t, n) {
	let r = Number(e);
	if (r < t || r > n) throw RangeError(`Value out of range: ${t} <= ${r} <= ${n}`);
	return r;
}
function pw(e) {
	return `${String(e.hour).padStart(2, "0")}:${String(e.minute).padStart(2, "0")}:${String(e.second).padStart(2, "0")}${e.millisecond ? String(e.millisecond / 1e3).slice(1) : ""}`;
}
function mw(e) {
	let t = FC(e, new zS()), n;
	return n = t.era === "BC" ? t.year === 1 ? "0000" : "-" + String(Math.abs(1 - t.year)).padStart(6, "00") : String(t.year).padStart(4, "0"), `${n}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}
function hw(e) {
	return `${mw(e)}T${pw(e)}`;
}
function gw(e) {
	let t = Math.sign(e) < 0 ? "-" : "+";
	e = Math.abs(e);
	let n = Math.floor(e / 36e5), r = Math.floor(e % 36e5 / 6e4), i = Math.floor(e % 36e5 % 6e4 / 1e3), a = `${t}${String(n).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
	return i !== 0 && (a += `:${String(i).padStart(2, "0")}`), a;
}
function _w(e) {
	return `${hw(e)}${gw(e.offset)}[${e.timeZone}]`;
}
var vw, yw, bw, xw = t((() => {
	Ew(), VC(), BS(), vw = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})$/, yw = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?(?:(?:([+-]\d{2})(?::?(\d{2}))?)|Z)$/, bw = [
		"hours",
		"minutes",
		"seconds"
	], [...bw];
}));
//#endregion
//#region node_modules/.pnpm/@internationalized+date@3.12.2/node_modules/@internationalized/date/dist/private/CalendarDate.mjs
function Sw(e) {
	let t = typeof e[0] == "object" ? e.shift() : new zS(), n;
	if (typeof e[0] == "string") n = e.shift();
	else {
		let e = t.getEras();
		n = e[e.length - 1];
	}
	let r = e.shift(), i = e.shift(), a = e.shift();
	return [
		t,
		n,
		r,
		i,
		a
	];
}
var Cw, ww, Tw, Ew = t((() => {
	uw(), CC(), xw(), BS(), VC(), Cw = class e {
		constructor(...e) {
			let [t, n, r, i, a] = Sw(e);
			this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, qC(this);
		}
		copy() {
			return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day) : new e(this.calendar, this.year, this.month, this.day);
		}
		add(e) {
			return HC(this, e);
		}
		subtract(e) {
			return YC(this, e);
		}
		set(e) {
			return XC(this, e);
		}
		cycle(e, t, n) {
			return nw(this, e, t, n);
		}
		toDate(e) {
			return jC(this, e);
		}
		toString() {
			return mw(this);
		}
		compare(e) {
			return eC(this, e);
		}
	}, ww = class e {
		constructor(...e) {
			let [t, n, r, i, a] = Sw(e);
			this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, qC(this);
		}
		copy() {
			return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
		}
		add(e) {
			return HC(this, e);
		}
		subtract(e) {
			return YC(this, e);
		}
		set(e) {
			return XC(ZC(this, e), e);
		}
		cycle(e, t, n) {
			switch (e) {
				case "era":
				case "year":
				case "month":
				case "day": return nw(this, e, t, n);
				default: return rw(this, e, t, n);
			}
		}
		toDate(e, t) {
			return jC(this, e, t);
		}
		toString() {
			return hw(this);
		}
		compare(e) {
			let t = eC(this, e);
			return t === 0 ? tC(this, PC(e)) : t;
		}
	}, Tw = class e {
		constructor(...e) {
			let [t, n, r, i, a] = Sw(e), o = e.shift(), s = e.shift();
			this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.timeZone = o, this.offset = s, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, qC(this);
		}
		copy() {
			return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
		}
		add(e) {
			return aw(this, e);
		}
		subtract(e) {
			return ow(this, e);
		}
		set(e, t) {
			return cw(this, e, t);
		}
		cycle(e, t, n) {
			return sw(this, e, t, n);
		}
		toDate() {
			return LC(this);
		}
		toString() {
			return _w(this);
		}
		toAbsoluteString() {
			return this.toDate().toISOString();
		}
		compare(e) {
			return this.toDate().getTime() - IC(e, this.timeZone).toDate().getTime();
		}
	};
}));
//#endregion
//#region node_modules/.pnpm/@internationalized+date@3.12.2/node_modules/@internationalized/date/dist/private/DateFormatter.mjs
function Dw(e, t = {}) {
	if (typeof t.hour12 == "boolean" && Ow()) {
		t = { ...t };
		let n = Nw[String(t.hour12)][e.split("-")[0]], r = t.hour12 ? "h12" : "h23";
		t.hourCycle = n ?? r, delete t.hour12;
	}
	let n = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
	if (jw.has(n)) return jw.get(n);
	let r = new Intl.DateTimeFormat(e, t);
	return jw.set(n, r), r;
}
function Ow() {
	return Pw ??= new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		hour12: !1
	}).format(new Date(2020, 2, 3, 0)) === "24", Pw;
}
function kw() {
	return Fw ??= new Intl.DateTimeFormat("fr", {
		hour: "numeric",
		hour12: !1
	}).resolvedOptions().hourCycle === "h12", Fw;
}
function Aw(e, t) {
	if (!t.timeStyle && !t.hour) return;
	e = e.replace(/(-u-)?-nu-[a-zA-Z0-9]+/, ""), e += (e.includes("-u-") ? "" : "-u") + "-nu-latn";
	let n = Dw(e, {
		...t,
		timeZone: void 0
	}), r = parseInt(n.formatToParts(new Date(2020, 2, 3, 0)).find((e) => e.type === "hour").value, 10), i = parseInt(n.formatToParts(new Date(2020, 2, 3, 23)).find((e) => e.type === "hour").value, 10);
	if (r === 0 && i === 23) return "h23";
	if (r === 24 && i === 23) return "h24";
	if (r === 0 && i === 11) return "h11";
	if (r === 12 && i === 11) return "h12";
	throw Error("Unexpected hour cycle result");
}
var jw, Mw, Nw, Pw, Fw, Iw = t((() => {
	jw = /* @__PURE__ */ new Map(), Mw = class {
		constructor(e, t = {}) {
			this.formatter = Dw(e, t), this.options = t;
		}
		format(e) {
			return this.formatter.format(e);
		}
		formatToParts(e) {
			return this.formatter.formatToParts(e);
		}
		formatRange(e, t) {
			if (typeof this.formatter.formatRange == "function") return this.formatter.formatRange(e, t);
			if (t < e) throw RangeError("End date must be >= start date");
			return `${this.formatter.format(e)} \u{2013} ${this.formatter.format(t)}`;
		}
		formatRangeToParts(e, t) {
			if (typeof this.formatter.formatRangeToParts == "function") return this.formatter.formatRangeToParts(e, t);
			if (t < e) throw RangeError("End date must be >= start date");
			let n = this.formatter.formatToParts(e), r = this.formatter.formatToParts(t);
			return [
				...n.map((e) => ({
					...e,
					source: "startRange"
				})),
				{
					type: "literal",
					value: " – ",
					source: "shared"
				},
				...r.map((e) => ({
					...e,
					source: "endRange"
				}))
			];
		}
		resolvedOptions() {
			let e = this.formatter.resolvedOptions();
			return kw() && (this.resolvedHourCycle ||= Aw(e.locale, this.options), e.hourCycle = this.resolvedHourCycle, e.hour12 = this.resolvedHourCycle === "h11" || this.resolvedHourCycle === "h12"), e.calendar === "ethiopic-amete-alem" && (e.calendar = "ethioaa"), e;
		}
	}, Nw = {
		true: { ja: "h11" },
		false: {}
	}, Pw = null, Fw = null;
})), Lw = t((() => {
	Ew(), VC(), CC(), xw(), Iw();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/constrain.mjs
function Rw(e, t, n, r, i) {
	let a = {};
	for (let e in t) {
		let n = e, r = t[n];
		r != null && (a[n] = Math.floor(r / 2), a[n] > 0 && r % 2 == 0 && a[n]--);
	}
	return Vw(e, zw(e, t, n).subtract(a), t, n, r, i);
}
function zw(e, t, n, r, i) {
	let a = e;
	return t.years ? a = sC(e) : t.months ? a = aC(e) : t.weeks && (a = lC(e, n)), Vw(e, a, t, n, r, i);
}
function Bw(e, t, n, r, i) {
	let a = { ...t };
	return a.days ? a.days-- : a.weeks ? a.weeks-- : a.months ? a.months-- : a.years && a.years--, Vw(e, zw(e, t, n).subtract(a), t, n, r, i);
}
function Vw(e, t, n, r, i, a) {
	return i && e.compare(i) >= 0 && (t = hC(t, zw(NC(i), n, r))), a && e.compare(a) <= 0 && (t = mC(t, Bw(NC(a), n, r))), t;
}
function Hw(e, t, n) {
	let r = NC(e), i = t ? NC(t) : void 0, a = n ? NC(n) : void 0, o = r;
	return i && (o = hC(o, i)), a && (o = mC(o, a)), o.compare(r) === 0 ? e : "hour" in e ? e.set({
		year: o.year,
		month: o.month,
		day: o.day
	}) : o;
}
var Uw = t((() => {
	Lw();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/align.mjs
function Ww(e, t, n, r, i, a) {
	switch (t) {
		case "start": return zw(e, n, r, i, a);
		case "end": return Bw(e, n, r, i, a);
		default: return Rw(e, n, r, i, a);
	}
}
var Gw = t((() => {
	Uw();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/assertion.mjs
function Kw(e, t) {
	return e == null || t == null ? e === t : !("hour" in e) && !("hour" in t) ? US(e, t) : PC(e).compare(PC(t)) === 0;
}
function qw(e, t, n, r, i) {
	return e ? t?.(e, n) ? !0 : Jw(e, r, i) : !1;
}
function Jw(e, t, n) {
	return t != null && e.compare(t) < 0 || n != null && e.compare(n) > 0;
}
function Yw(e, t, n) {
	let r = e.subtract({ days: 1 });
	return US(r, e) || Jw(r, t, n);
}
function Xw(e, t, n) {
	let r = e.add({ days: 1 });
	return US(r, e) || Jw(r, t, n);
}
var Zw = t((() => {
	Lw();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/duration.mjs
function Qw(e) {
	let t = { ...e };
	for (let e in t) t[e] = 1;
	return t;
}
function $w(e, t) {
	let n = { ...t };
	return n.days ? n.days-- : n.days = -1, e.add(n);
}
var eT = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/get-era-format.mjs
function tT(e) {
	if (!e) return;
	let t = e.calendar.identifier;
	return t === "gregory" || t === "iso8601" ? e.era === "BC" ? "short" : void 0 : "short";
}
var nT = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/formatter.mjs
function rT(e, t, n) {
	let r = n ?? PC($S(t));
	return new Mw(e, {
		weekday: "long",
		month: "long",
		year: "numeric",
		day: "numeric",
		era: tT(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
function iT(e, t, n) {
	let r = n ?? $S(t);
	return new Mw(e, {
		month: "long",
		year: "numeric",
		era: tT(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
var aT = t((() => {
	Lw(), nT();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/format.mjs
function oT(e, t, n, r, i) {
	let a = n.formatRangeToParts(e.toDate(i), t.toDate(i)), o = -1;
	for (let e = 0; e < a.length; e++) {
		let t = a[e];
		if (t.source === "shared" && t.type === "literal") o = e;
		else if (t.source === "endRange") break;
	}
	let s = "", c = "";
	for (let e = 0; e < a.length; e++) e < o ? s += a[e].value : e > o && (c += a[e].value);
	return r(s, c);
}
function sT(e, t, n, r) {
	if (!e) return "";
	let i = e, a = t ?? e, o = rT(n, r);
	return US(i, a) ? o.format(i.toDate(r)) : oT(i, a, o, (e, t) => `${e} \u2013 ${t}`, r);
}
var cT = t((() => {
	Lw(), aT();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/date-month.mjs
function lT(e) {
	return e == null ? void 0 : _T[e];
}
function uT(e, t, n) {
	return lC(e, t, lT(n));
}
function dT(e, t, n, r) {
	let i = t.add({ weeks: e }), a = [], o = uT(i, n, r);
	for (; a.length < 7;) {
		a.push(o);
		let e = o.add({ days: 1 });
		if (US(o, e)) break;
		o = e;
	}
	return a;
}
function fT(e, t, n, r) {
	let i = lT(r), a = n ?? pC(e, t, i);
	return [...Array(a).keys()].map((n) => dT(n, e, t, r));
}
function pT(e, t) {
	let n = new Mw(e, {
		weekday: "long",
		timeZone: t
	}), r = new Mw(e, {
		weekday: "short",
		timeZone: t
	}), i = new Mw(e, {
		weekday: "narrow",
		timeZone: t
	});
	return (e) => {
		let a = e instanceof Date ? e : e.toDate(t);
		return {
			value: e,
			short: r.format(a),
			long: n.format(a),
			narrow: i.format(a)
		};
	};
}
function mT(e, t, n, r) {
	let i = uT(e, r, t), a = [...Array(7).keys()], o = pT(r, n);
	return a.map((e) => o(i.add({ days: e })));
}
function hT(e, t = "long", n) {
	if (!n || n.calendar.identifier === "gregory" || n.calendar.identifier === "iso8601") {
		let n = new Date(2021, 0, 1), r = [];
		for (let i = 0; i < 12; i++) r.push(n.toLocaleString(e, { month: t })), n.setMonth(n.getMonth() + 1);
		return r;
	}
	let r = n.calendar.getMonthsInYear(n), i = new Mw(e, {
		month: t,
		calendar: n.calendar.identifier
	}), a = [];
	for (let e = 1; e <= r; e++) {
		let t = n.set({ month: e });
		a.push(i.format(t.toDate("UTC")));
	}
	return a;
}
function gT(e, t) {
	let n = lC(e, t, "mon"), r = n.year, i = lC(n.set({
		month: 1,
		day: 4
	}), t, "mon"), a = n.calendar.toJulianDay(n), o = i.calendar.toJulianDay(i);
	if (a >= o) return 1 + Math.floor((a - o) / 7);
	let s = lC(n.set({
		year: r - 1,
		month: 1,
		day: 4
	}), t, "mon"), c = s.calendar.toJulianDay(s);
	return 1 + Math.floor((a - c) / 7);
}
var _T, vT = t((() => {
	Lw(), _T = [
		"sun",
		"mon",
		"tue",
		"wed",
		"thu",
		"fri",
		"sat"
	];
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/date-year.mjs
function yT(e) {
	let t = [];
	for (let n = e.from; n <= e.to; n += 1) t.push(n);
	return t;
}
function bT(e, t, n) {
	let r = e.calendar;
	return {
		from: t?.year ?? FC(new Cw(CT, 1, 1), r).year,
		to: n?.year ?? FC(new Cw(wT, 12, 31), r).year
	};
}
function xT(e) {
	if (e) {
		if (e.length === 3) return e.padEnd(4, "0");
		if (e.length === 2) {
			let t = (/* @__PURE__ */ new Date()).getFullYear(), n = Math.floor(t / 100) * 100 + parseInt(e.slice(-2), 10);
			return n > t + TT ? (n - 100).toString() : n.toString();
		}
		return e;
	}
}
function ST(e, t) {
	let n = t?.strict ? 10 : 12, r = e - e % 10, i = [];
	for (let e = 0; e < n; e += 1) {
		let t = r + e;
		i.push(t);
	}
	return i;
}
var CT, wT, TT, ET = t((() => {
	Lw(), CT = 1900, wT = 2099, TT = 10;
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/mutation.mjs
function DT(e, t) {
	let n = $S(e ?? rC());
	return t ? FC(n, t) : n;
}
var OT = t((() => {
	Lw();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/pagination.mjs
function kT(e, t, n, r) {
	return function(i) {
		let { startDate: a, focusedDate: o } = i, s = $w(a, e);
		return Jw(o, n, r) ? {
			startDate: a,
			focusedDate: Hw(o, n, r),
			endDate: s
		} : o.compare(a) < 0 ? {
			startDate: Bw(o, e, t, n, r),
			focusedDate: Hw(o, n, r),
			endDate: s
		} : o.compare(s) > 0 ? {
			startDate: zw(o, e, t, n, r),
			endDate: s,
			focusedDate: Hw(o, n, r)
		} : {
			startDate: a,
			endDate: s,
			focusedDate: Hw(o, n, r)
		};
	};
}
function AT(e, t, n, r, i, a) {
	let o = kT(n, r, i, a), s = t.add(n);
	return o({
		focusedDate: e.add(n),
		startDate: zw(Vw(e, s, n, r, i, a), n, r)
	});
}
function jT(e, t, n, r, i, a) {
	let o = kT(n, r, i, a), s = t.subtract(n);
	return o({
		focusedDate: e.subtract(n),
		startDate: zw(Vw(e, s, n, r, i, a), n, r)
	});
}
function MT(e, t, n, r, i, a, o) {
	let s = kT(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.add(Qw(r)),
		startDate: t
	});
	if (r.days) return AT(e, t, r, i, a, o);
	if (r.weeks) return s({
		focusedDate: e.add({ months: 1 }),
		startDate: t
	});
	if (r.months || r.years) return s({
		focusedDate: e.add({ years: 1 }),
		startDate: t
	});
}
function NT(e, t, n, r, i, a, o) {
	let s = kT(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.subtract(Qw(r)),
		startDate: t
	});
	if (r.days) return jT(e, t, r, i, a, o);
	if (r.weeks) return s({
		focusedDate: e.subtract({ months: 1 }),
		startDate: t
	});
	if (r.months || r.years) return s({
		focusedDate: e.subtract({ years: 1 }),
		startDate: t
	});
}
var PT = t((() => {
	Zw(), Uw(), eT();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/locale.mjs
function FT(e) {
	let t = LT.get(e);
	return t ?? (t = "0123456789" + new Intl.NumberFormat(e, { useGrouping: !1 }).format(1234567890), LT.set(e, t), t);
}
function IT(e) {
	let t = VT.get(e);
	if (t != null) return t;
	let n = new Intl.DateTimeFormat(e).formatToParts(/* @__PURE__ */ new Date()).find((e) => e.type === "literal");
	return t = n ? n.value : "/", VT.set(e, t), t;
}
var LT, RT, zT, BT, VT, HT = t((() => {
	LT = /* @__PURE__ */ new Map(), RT = (e, t) => t ? FT(t).includes(e) : /\d/.test(e), zT = (e, t, n) => !e || e.length !== 1 || RT(e, n) || t.includes(e), BT = (e, t, n) => e.split("").filter((e) => zT(e, t, n)).join(""), VT = /* @__PURE__ */ new Map();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/parse-date.mjs
function UT(e, t, n) {
	let { year: r, month: i, day: a } = GT(WT(t, n), e) ?? {};
	if (r != null || i != null || a != null) {
		let e = /* @__PURE__ */ new Date();
		r ||= e.getFullYear().toString(), i ||= (e.getMonth() + 1).toString(), a ||= e.getDate().toString();
	}
	if (KT(r) || (r = xT(r)), KT(r) && qT(i) && JT(a)) return new Cw(+r, +i, +a);
	let o = Date.parse(e);
	if (!isNaN(o)) {
		let e = new Date(o);
		return new Cw(e.getFullYear(), e.getMonth() + 1, e.getDate());
	}
}
function WT(e, t) {
	return new Mw(e, {
		day: "numeric",
		month: "numeric",
		year: "numeric",
		timeZone: t
	}).formatToParts(new Date(2e3, 11, 25)).map(({ type: e, value: t }) => e === "literal" ? `${t}?` : `((?!=<${e}>)\\d+)?`).join("");
}
function GT(e, t) {
	let n = t.match(e);
	return e.toString().match(/<(.+?)>/g)?.map((e) => {
		let t = e.match(/<(.+)>/);
		return !t || t.length <= 0 ? null : e.match(/<(.+)>/)?.[1];
	}).reduce((e, t, r) => (t && (n && n.length > r ? e[t] = n[r + 1] : e[t] = null), e), {});
}
var KT, qT, JT, YT = t((() => {
	Lw(), ET(), KT = (e) => e != null && e.length === 4, qT = (e) => e != null && parseFloat(e) <= 12, JT = (e) => e != null && parseFloat(e) <= 31;
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-utils@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-utils/dist/preset.mjs
function XT(e, t, n) {
	let r = NC(QS(n));
	switch (e) {
		case "thisWeek": return [lC(r, t), uC(r, t)];
		case "thisMonth": return [aC(r), r];
		case "thisQuarter": return [aC(r).add({ months: -((r.month - 1) % 3) }), r];
		case "thisYear": return [sC(r), r];
		case "last3Days": return [r.add({ days: -2 }), r];
		case "last7Days": return [r.add({ days: -6 }), r];
		case "last14Days": return [r.add({ days: -13 }), r];
		case "last30Days": return [r.add({ days: -29 }), r];
		case "last90Days": return [r.add({ days: -89 }), r];
		case "lastMonth": return [aC(r.add({ months: -1 })), oC(r.add({ months: -1 }))];
		case "lastQuarter": return [aC(r.add({ months: -((r.month - 1) % 3) - 3 })), oC(r.add({ months: -((r.month - 1) % 3) - 1 }))];
		case "lastWeek": return [lC(r, t).add({ weeks: -1 }), uC(r, t).add({ weeks: -1 })];
		case "lastYear": return [sC(r.add({ years: -1 })), cC(r.add({ years: -1 }))];
		default: throw Error(`Invalid date range preset: ${e}`);
	}
}
var ZT = t((() => {
	Lw();
})), QT = t((() => {
	Gw(), Zw(), Uw(), eT(), cT(), aT(), vT(), ET(), OT(), PT(), HT(), YT(), ZT();
})), $T, eE, tE, nE, rE, iE, aE, oE, sE, cE, lE, uE, dE, fE, pE, mE, hE, gE, _E, vE, yE, bE, xE, SE, CE = t((() => {
	Y(), $T = (e, t) => e.ids?.label?.(t) ?? `datepicker:${e.id}:label:${t}`, eE = (e) => e.ids?.root ?? `datepicker:${e.id}`, tE = (e, t) => e.ids?.table?.(t) ?? `datepicker:${e.id}:table:${t}`, nE = (e) => e.ids?.content ?? `datepicker:${e.id}:content`, rE = (e, t) => e.ids?.cellTrigger?.(t) ?? `datepicker:${e.id}:cell-trigger:${t}`, iE = (e, t) => e.ids?.prevTrigger?.(t) ?? `datepicker:${e.id}:prev:${t}`, aE = (e, t) => e.ids?.nextTrigger?.(t) ?? `datepicker:${e.id}:next:${t}`, oE = (e, t) => e.ids?.viewTrigger?.(t) ?? `datepicker:${e.id}:view:${t}`, sE = (e) => e.ids?.clearTrigger ?? `datepicker:${e.id}:clear`, cE = (e) => e.ids?.control ?? `datepicker:${e.id}:control`, lE = (e, t) => e.ids?.input?.(t) ?? `datepicker:${e.id}:input:${t}`, uE = (e) => e.ids?.trigger ?? `datepicker:${e.id}:trigger`, dE = (e) => e.ids?.positioner ?? `datepicker:${e.id}:positioner`, fE = (e) => e.ids?.monthSelect ?? `datepicker:${e.id}:month-select`, pE = (e) => e.ids?.yearSelect ?? `datepicker:${e.id}:year-select`, mE = (e, t) => Zu(gE(e), `[data-part=table-cell-trigger][data-view=${t}][data-focus]:not([data-outside-range])`), hE = (e) => e.getById(uE(e)), gE = (e) => e.getById(nE(e)), _E = (e) => Xu(SE(e), "[data-part=input]"), vE = (e) => e.getById(pE(e)), yE = (e) => e.getById(fE(e)), bE = (e) => e.getById(sE(e)), xE = (e) => e.getById(dE(e)), SE = (e) => e.getById(cE(e));
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-picker@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-picker/dist/date-picker.utils.mjs
function wE(e) {
	let [t, n] = e, r;
	return r = !t || !n || t.compare(n) <= 0 ? e : [n, t], r;
}
function TE(e, t) {
	let [n, r] = t;
	return !n || !r ? !1 : n.compare(e) <= 0 && r.compare(e) >= 0;
}
function EE(e) {
	return e.slice().filter((e) => e != null).sort((e, t) => e.compare(t));
}
function DE(e) {
	return gf(e, {
		year: "calendar decade",
		month: "calendar year",
		day: "calendar month"
	});
}
function OE(e) {
	return new Mw(e).formatToParts(/* @__PURE__ */ new Date()).map((e) => LE[e.type] ?? e.value).join("");
}
function kE(e, t) {
	return e ? e === "day" ? 0 : e === "month" ? 1 : 2 : t || 0;
}
function AE(e) {
	return e === 0 ? "day" : e === 1 ? "month" : "year";
}
function jE(e, t, n) {
	return AE(Bf(kE(e, 0), kE(t, 0), kE(n, 2)));
}
function ME(e, t) {
	return kE(e, 0) > kE(t, 0);
}
function NE(e, t) {
	return kE(e, 0) < kE(t, 0);
}
function PE(e, t, n) {
	return jE(AE(kE(e, 0) + 1), t, n);
}
function FE(e, t, n) {
	return jE(AE(kE(e, 0) - 1), t, n);
}
function IE(e) {
	BE.forEach((t) => e(t));
}
var LE, RE, zE, BE, VE, HE = t((() => {
	Lw(), um(), QT(), X(), LE = {
		day: "dd",
		month: "mm",
		year: "yyyy"
	}, RE = (e) => !Number.isNaN(e.day) && !Number.isNaN(e.month) && !Number.isNaN(e.year), zE = {
		dayCell(e) {
			return e.unavailable ? `Not available. ${e.valueText}` : e.firstInRange ? `Starting range from ${e.valueText}` : e.lastInRange ? `Range ending at ${e.valueText}` : e.selected ? `Selected date. ${e.valueText}` : `Choose ${e.valueText}`;
		},
		trigger(e) {
			return e ? "Close calendar" : "Open calendar";
		},
		viewTrigger(e) {
			return gf(e, {
				year: "Switch to month view",
				month: "Switch to day view",
				day: "Switch to year view"
			});
		},
		presetTrigger(e) {
			let [t = "", n = ""] = e;
			return `select ${t} to ${n}`;
		},
		prevTrigger(e) {
			return gf(e, {
				year: "Switch to previous decade",
				month: "Switch to previous year",
				day: "Switch to previous month"
			});
		},
		nextTrigger(e) {
			return gf(e, {
				year: "Switch to next decade",
				month: "Switch to next year",
				day: "Switch to next month"
			});
		},
		placeholder() {
			return {
				day: "dd",
				month: "mm",
				year: "yyyy"
			};
		},
		content: "calendar",
		monthSelect: "Select month",
		yearSelect: "Select year",
		clearTrigger: "Clear selected dates",
		weekColumnHeader: "Wk",
		weekNumberCell(e) {
			return `Week ${e}`;
		}
	}, BE = [
		"day",
		"month",
		"year"
	], VE = Ap((e) => [
		e.view,
		e.startValue.toString(),
		e.endValue.toString(),
		e.locale,
		e.timeZone,
		e.selectionMode
	], ([e], t) => {
		let { startValue: n, endValue: r, locale: i, timeZone: a, selectionMode: o } = t;
		if (e === "year") {
			let e = ST(n.year, { strict: !0 }), t = e.at(0).toString(), r = e.at(-1).toString();
			return {
				start: t,
				end: r,
				formatted: `${t} - ${r}`
			};
		}
		if (e === "month") {
			let e = new Mw(i, {
				year: "numeric",
				timeZone: a,
				calendar: n.calendar.identifier
			}), t = e.format(n.toDate(a)), s = e.format(r.toDate(a));
			return {
				start: t,
				end: s,
				formatted: o === "range" ? `${t} - ${s}` : t
			};
		}
		let s = new Mw(i, {
			month: "long",
			year: "numeric",
			timeZone: a,
			calendar: n.calendar.identifier
		}), c = s.format(n.toDate(a)), l = s.format(r.toDate(a));
		return {
			start: c,
			end: l,
			formatted: o === "range" ? `${c} - ${l}` : c
		};
	});
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-picker@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-picker/dist/date-picker.connect.mjs
function UE(e, t) {
	let { state: n, context: r, prop: i, send: a, computed: o, scope: s } = e, c = r.get("startValue"), l = o("endValue"), u = r.get("value"), d = r.get("focusedValue"), f = r.get("hoveredValue"), p = f ? wE([u[0], f]) : [], m = !!i("disabled"), h = !!i("readOnly"), g = !!i("invalid"), _ = o("isInteractive"), v = u.length === 0, y = i("min"), b = i("max"), x = i("locale"), S = i("timeZone"), C = i("startOfWeek"), w = n.matches("focused"), T = n.matches("open"), E = i("selectionMode") === "range", D = i("selectionMode") === "multiple", ee = i("isDateUnavailable"), O = i("maxSelectedDates"), te = D && O != null && u.length >= O, ne = r.get("currentPlacement"), re = ne ? Ly(ne) : void 0, ie = rb({
		...i("positioning"),
		placement: ne
	}), k = IT(x), ae = {
		...zE,
		...i("translations")
	};
	function A(e = c) {
		let t = i("fixedWeeks") ? 6 : void 0;
		return fT(e, x, t, C);
	}
	function oe(e = {}) {
		let { format: t } = e;
		return hT(x, t, d).map((e, t) => {
			let n = t + 1;
			return {
				label: e,
				value: n,
				disabled: Jw(d.set({ month: n }), y, b)
			};
		});
	}
	function se() {
		return yT(bT(d, y, b)).map((e) => ({
			label: e.toString(),
			value: e,
			disabled: !zf(e, y?.year, b?.year)
		}));
	}
	function ce(e) {
		return qw(e, ee, x, y, b);
	}
	function le(e) {
		let t = c ?? DT(S, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ month: e })
		});
	}
	function j(e) {
		let t = c ?? DT(S, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ year: e })
		});
	}
	function ue(e) {
		let { value: t, disabled: n } = e, r = d.set({ year: t }), i = !ST(c.year, { strict: !0 }).includes(t), a = zf(t, y?.year, b?.year), o = E && TE(r, u), s = E && u[0] && JS(r, u[0]), l = E && u[1] && JS(r, u[1]), f = E && p.length > 0, m = f && TE(r, p), h = f && p[0] && JS(r, p[0]), g = f && p[1] && JS(r, p[1]), _ = {
			focused: d.year === e.value,
			selectable: !i && a,
			outsideRange: i,
			selected: !!u.find((e) => e && e.year === t),
			valueText: t.toString(),
			inRange: o || m,
			firstInRange: !!s,
			lastInRange: !!l,
			inHoveredRange: !!m,
			firstInHoveredRange: !!h,
			lastInHoveredRange: !!g,
			value: r,
			get disabled() {
				return n || !_.selectable;
			}
		};
		return _;
	}
	function de(e) {
		let { value: t, disabled: n } = e, r = d.set({ month: t }), i = iT(x, S, d), a = E && TE(r, u), o = E && u[0] && qS(r, u[0]), s = E && u[1] && qS(r, u[1]), c = E && p.length > 0, l = c && TE(r, p), f = c && p[0] && qS(r, p[0]), m = c && p[1] && qS(r, p[1]), h = {
			focused: d.month === e.value,
			selectable: !Jw(r, y, b),
			selected: !!u.find((e) => e && e.month === t && e.year === d.year),
			valueText: i.format(r.toDate(S)),
			inRange: a || l,
			firstInRange: !!o,
			lastInRange: !!s,
			inHoveredRange: !!l,
			firstInHoveredRange: !!f,
			lastInHoveredRange: !!m,
			outsideRange: !1,
			value: r,
			get disabled() {
				return n || !h.selectable;
			}
		};
		return h;
	}
	function fe(e) {
		let { value: t, disabled: n, visibleRange: r = o("visibleRange") } = e, a = rT(x, S, d), s = Qw(o("visibleDuration")), c = i("outsideDaySelectable"), l = r.start.add(s).subtract({ days: 1 }), f = Jw(t, r.start, l), m = E && TE(t, u), h = E && u[0] && US(t, u[0]), g = E && u[1] && US(t, u[1]), _ = E && p.length > 0, v = _ && TE(t, p), C = _ && p[0] && US(t, p[0]), w = _ && p[1] && US(t, p[1]), T = u.some((e) => e != null && US(t, e)), D = {
			invalid: Jw(t, y, b),
			disabled: n || !c && f || Jw(t, y, b) || te && !T,
			selected: T,
			unavailable: qw(t, ee, x, y, b) && !n,
			outsideRange: f,
			today: XS(t, S),
			weekend: gC(t, x),
			value: t,
			valueText: a.format(t.toDate(S)),
			get focused() {
				return d != null && US(t, d) && (!D.outsideRange || c);
			},
			get selectable() {
				return !D.disabled && !D.unavailable;
			},
			inRange: m || v,
			firstInRange: h,
			lastInRange: g,
			inHoveredRange: v,
			firstInHoveredRange: C,
			lastInHoveredRange: w
		};
		return D;
	}
	function pe(e) {
		let { view: t = "day", id: n } = e;
		return [t, n].filter(Boolean).join(" ");
	}
	return {
		focused: w,
		open: T,
		disabled: m,
		invalid: g,
		readOnly: h,
		inline: !!i("inline"),
		numOfMonths: i("numOfMonths"),
		showWeekNumbers: !!i("showWeekNumbers"),
		selectionMode: i("selectionMode"),
		maxSelectedDates: O,
		isMaxSelected: te,
		view: r.get("view"),
		getRangePresetValue(e) {
			return XT(e, x, S);
		},
		getWeekNumber(e) {
			let t = e[0];
			return t ? gT(t, x) : 0;
		},
		getDaysInWeek(e, t = c) {
			return dT(e, t, x, C);
		},
		getOffset(e) {
			let t = c.add(e), n = l.add(e), r = iT(x, S, d);
			return {
				visibleRange: {
					start: t,
					end: n
				},
				weeks: A(t),
				visibleRangeText: {
					start: r.format(t.toDate(S)),
					end: r.format(n.toDate(S))
				}
			};
		},
		getMonthWeeks: A,
		isUnavailable: ce,
		weeks: A(),
		weekDays: mT(c, C, S, x),
		visibleRangeText: o("visibleRangeText"),
		value: u,
		valueAsDate: u.filter((e) => e != null).map((e) => e.toDate(S)),
		valueAsString: o("valueAsString"),
		focusedValue: d,
		focusedValueAsDate: d?.toDate(S),
		focusedValueAsString: i("format")(d, {
			locale: x,
			timeZone: S
		}),
		visibleRange: o("visibleRange"),
		selectToday() {
			let e = Hw(DT(S, d.calendar), y, b);
			a({
				type: "VALUE.SET",
				value: [e]
			});
		},
		setValue(e) {
			let t = e.map((e) => Hw(e, y, b));
			a({
				type: "VALUE.SET",
				value: t
			});
		},
		setTime(e, t = 0) {
			let n = Array.from(u), r = n[t];
			r && ("hour" in r || (r = PC(r)), r = r.set({
				hour: e.hour ?? ("hour" in r ? r.hour : 0),
				minute: e.minute ?? ("minute" in r ? r.minute : 0),
				second: e.second ?? ("second" in r ? r.second : 0),
				millisecond: e.millisecond ?? ("millisecond" in r ? r.millisecond : 0)
			}), n[t] = Hw(r, y, b), a({
				type: "VALUE.SET",
				value: n
			}));
		},
		clearValue(e = {}) {
			let { focus: t = !0 } = e;
			a({
				type: "VALUE.CLEAR",
				focus: t
			});
		},
		setFocusedValue(e) {
			a({
				type: "FOCUS.SET",
				value: e
			});
		},
		setOpen(e) {
			i("inline") || n.matches("open") !== e && a({ type: e ? "OPEN" : "CLOSE" });
		},
		focusMonth: le,
		focusYear: j,
		getYears: se,
		getMonths: oe,
		getYearsGrid(e = {}) {
			let { columns: t = 1 } = e;
			return Ld(ST(c.year, { strict: !0 }).map((e) => ({
				label: e.toString(),
				value: e,
				disabled: !zf(e, y?.year, b?.year)
			})), t);
		},
		getDecade() {
			let e = ST(c.year, { strict: !0 });
			return {
				start: e.at(0),
				end: e.at(-1)
			};
		},
		getMonthsGrid(e = {}) {
			let { columns: t = 1, format: n } = e;
			return Ld(oe({ format: n }), t);
		},
		format(e, t = {
			month: "long",
			year: "numeric"
		}) {
			return new Mw(x, {
				...t,
				calendar: e.calendar.identifier
			}).format(e.toDate(S));
		},
		setView(e) {
			a({
				type: "VIEW.SET",
				view: e
			});
		},
		goToNext() {
			a({
				type: "GOTO.NEXT",
				view: r.get("view")
			});
		},
		goToPrev() {
			a({
				type: "GOTO.PREV",
				view: r.get("view")
			});
		},
		getRootProps() {
			return t.element({
				...Q.root.attrs,
				dir: i("dir"),
				id: eE(s),
				"data-state": T ? "open" : "closed",
				"data-disabled": K(m),
				"data-readonly": K(h),
				"data-empty": K(v)
			});
		},
		getLabelProps(e = {}) {
			let { index: n = 0 } = e;
			return t.label({
				...Q.label.attrs,
				id: $T(s, n),
				dir: i("dir"),
				htmlFor: lE(s, n),
				"data-state": T ? "open" : "closed",
				"data-index": n,
				"data-disabled": K(m),
				"data-readonly": K(h)
			});
		},
		getControlProps() {
			return t.element({
				...Q.control.attrs,
				dir: i("dir"),
				id: cE(s),
				"data-disabled": K(m),
				"data-placeholder-shown": K(v)
			});
		},
		getRangeTextProps() {
			return t.element({
				...Q.rangeText.attrs,
				dir: i("dir")
			});
		},
		getContentProps() {
			return t.element({
				...Q.content.attrs,
				hidden: !T,
				dir: i("dir"),
				"data-state": T ? "open" : "closed",
				"data-placement": ne,
				"data-side": re,
				"data-inline": K(i("inline")),
				id: nE(s),
				tabIndex: -1,
				role: "application",
				"aria-roledescription": "datepicker",
				"aria-label": ae.content
			});
		},
		getTableProps(e = {}) {
			let { view: n = "day", columns: r = n === "day" ? 7 : 4 } = e, o = pe(e);
			return t.element({
				...Q.table.attrs,
				role: "grid",
				"data-columns": r,
				"aria-roledescription": DE(n),
				id: tE(s, o),
				"aria-readonly": wc(h),
				"aria-disabled": wc(m),
				"aria-multiselectable": wc(i("selectionMode") !== "single"),
				"data-view": n,
				dir: i("dir"),
				tabIndex: -1,
				onKeyDown(e) {
					if (e.defaultPrevented) return;
					let t = {
						Enter() {
							n === "day" && ce(d) || n === "month" && !de({ value: d.month }).selectable || n === "year" && !ue({ value: d.year }).selectable || a({
								type: "TABLE.ENTER",
								view: n,
								columns: r,
								focus: !0
							});
						},
						ArrowLeft() {
							a({
								type: "TABLE.ARROW_LEFT",
								view: n,
								columns: r,
								focus: !0
							});
						},
						ArrowRight() {
							a({
								type: "TABLE.ARROW_RIGHT",
								view: n,
								columns: r,
								focus: !0
							});
						},
						ArrowUp() {
							a({
								type: "TABLE.ARROW_UP",
								view: n,
								columns: r,
								focus: !0
							});
						},
						ArrowDown() {
							a({
								type: "TABLE.ARROW_DOWN",
								view: n,
								columns: r,
								focus: !0
							});
						},
						PageUp(e) {
							a({
								type: "TABLE.PAGE_UP",
								larger: e.shiftKey,
								view: n,
								columns: r,
								focus: !0
							});
						},
						PageDown(e) {
							a({
								type: "TABLE.PAGE_DOWN",
								larger: e.shiftKey,
								view: n,
								columns: r,
								focus: !0
							});
						},
						Home() {
							a({
								type: "TABLE.HOME",
								view: n,
								columns: r,
								focus: !0
							});
						},
						End() {
							a({
								type: "TABLE.END",
								view: n,
								columns: r,
								focus: !0
							});
						}
					}[kl(e, { dir: i("dir") })];
					t && (t(e), e.preventDefault(), e.stopPropagation());
				},
				onPointerLeave() {
					a({ type: "TABLE.POINTER_LEAVE" });
				},
				onPointerDown() {
					a({
						type: "TABLE.POINTER_DOWN",
						view: n
					});
				},
				onPointerUp() {
					a({
						type: "TABLE.POINTER_UP",
						view: n
					});
				}
			});
		},
		getTableHeadProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...Q.tableHead.attrs,
				"aria-hidden": !0,
				dir: i("dir"),
				"data-view": n,
				"data-disabled": K(m)
			});
		},
		getTableHeaderProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...Q.tableHeader.attrs,
				dir: i("dir"),
				"data-view": n,
				"data-disabled": K(m)
			});
		},
		getTableBodyProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...Q.tableBody.attrs,
				"data-view": n,
				"data-disabled": K(m)
			});
		},
		getTableRowProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...Q.tableRow.attrs,
				"aria-disabled": wc(m),
				"data-disabled": K(m),
				"data-view": n
			});
		},
		getWeekNumberHeaderCellProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...Q.tableCell.attrs,
				scope: "col",
				"aria-label": ae.weekColumnHeader,
				"data-view": n,
				"data-type": "week-number",
				"data-disabled": K(m)
			});
		},
		getWeekNumberCellProps(e) {
			let { weekIndex: n, week: r } = e, i = r[0] ? gT(r[0], x) : 0;
			return t.element({
				...Q.tableCell.attrs,
				role: "rowheader",
				"aria-label": ae.weekNumberCell?.(i),
				"data-view": "day",
				"data-week-index": n,
				"data-type": "week-number",
				"data-disabled": K(m)
			});
		},
		getDayTableCellState: fe,
		getDayTableCellProps(e) {
			let { value: n } = e, r = fe(e);
			return t.element({
				...Q.tableCell.attrs,
				role: "gridcell",
				"aria-disabled": wc(!r.selectable),
				"aria-selected": r.selected || r.inRange,
				"aria-invalid": wc(r.invalid),
				"aria-current": r.today ? "date" : void 0,
				"data-value": n.toString()
			});
		},
		getDayTableCellTriggerProps(e) {
			let { value: n } = e, r = fe(e);
			return t.element({
				...Q.tableCellTrigger.attrs,
				id: rE(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: r.focused ? 0 : -1,
				"aria-label": ae.dayCell(r),
				"aria-disabled": wc(!r.selectable),
				"aria-invalid": wc(r.invalid),
				"data-disabled": K(!r.selectable),
				"data-selectable": K(r.selectable),
				"data-selected": K(r.selected),
				"data-value": n.toString(),
				"data-view": "day",
				"data-today": K(r.today),
				"data-focus": K(r.focused),
				"data-unavailable": K(r.unavailable),
				"data-range-start": K(r.firstInRange),
				"data-range-end": K(r.lastInRange),
				"data-in-range": K(r.inRange),
				"data-outside-range": K(r.outsideRange),
				"data-weekend": K(r.weekend),
				"data-in-hover-range": K(r.inHoveredRange),
				"data-hover-range-start": K(r.firstInHoveredRange),
				"data-hover-range-end": K(r.lastInHoveredRange),
				onClick(e) {
					e.defaultPrevented || r.selectable && a({
						type: "CELL.CLICK",
						cell: "day",
						value: n
					});
				},
				onPointerMove: E ? (e) => {
					if (e.pointerType === "touch" || !r.selectable) return;
					let t = !s.isActiveElement(e.currentTarget);
					f && KS(n, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "day",
						value: n,
						focus: t,
						outsideRange: r.outsideRange
					});
				} : void 0
			});
		},
		getMonthTableCellState: de,
		getMonthTableCellProps(e) {
			let { value: n, columns: r } = e, a = de(e);
			return t.element({
				...Q.tableCell.attrs,
				dir: i("dir"),
				colSpan: r,
				role: "gridcell",
				"aria-selected": wc(a.selected || a.inRange),
				"data-selected": K(a.selected),
				"aria-disabled": wc(!a.selectable),
				"data-value": n
			});
		},
		getMonthTableCellTriggerProps(e) {
			let { value: n } = e, r = de(e);
			return t.element({
				...Q.tableCellTrigger.attrs,
				id: rE(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": wc(!r.selectable),
				"data-disabled": K(!r.selectable),
				"data-selectable": K(r.selectable),
				"data-selected": K(r.selected),
				"data-value": n,
				"data-view": "month",
				"data-focus": K(r.focused),
				"data-outside-range": K(r.outsideRange),
				"data-range-start": K(r.firstInRange),
				"data-range-end": K(r.lastInRange),
				"data-in-range": K(r.inRange),
				"data-in-hover-range": K(r.inHoveredRange),
				"data-hover-range-start": K(r.firstInHoveredRange),
				"data-hover-range-end": K(r.lastInHoveredRange),
				onClick(e) {
					e.defaultPrevented || r.selectable && a({
						type: "CELL.CLICK",
						cell: "month",
						value: n
					});
				},
				onPointerMove: E ? (e) => {
					if (e.pointerType === "touch" || !r.selectable) return;
					let t = !s.isActiveElement(e.currentTarget);
					f && r.value && qS(r.value, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "month",
						value: r.value,
						focus: t
					});
				} : void 0
			});
		},
		getYearTableCellState: ue,
		getYearTableCellProps(e) {
			let { value: n, columns: r } = e, a = ue(e);
			return t.element({
				...Q.tableCell.attrs,
				dir: i("dir"),
				colSpan: r,
				role: "gridcell",
				"aria-selected": wc(a.selected || a.inRange),
				"data-selected": K(a.selected),
				"aria-disabled": wc(!a.selectable),
				"data-value": n
			});
		},
		getYearTableCellTriggerProps(e) {
			let { value: n } = e, r = ue(e);
			return t.element({
				...Q.tableCellTrigger.attrs,
				id: rE(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": wc(!r.selectable),
				"data-disabled": K(!r.selectable),
				"data-selectable": K(r.selectable),
				"data-selected": K(r.selected),
				"data-value": n,
				"data-view": "year",
				"data-focus": K(r.focused),
				"data-outside-range": K(r.outsideRange),
				"data-range-start": K(r.firstInRange),
				"data-range-end": K(r.lastInRange),
				"data-in-range": K(r.inRange),
				"data-in-hover-range": K(r.inHoveredRange),
				"data-hover-range-start": K(r.firstInHoveredRange),
				"data-hover-range-end": K(r.lastInHoveredRange),
				onClick(e) {
					e.defaultPrevented || r.selectable && a({
						type: "CELL.CLICK",
						cell: "year",
						value: n
					});
				},
				onPointerMove: E ? (e) => {
					if (e.pointerType === "touch" || !r.selectable) return;
					let t = !s.isActiveElement(e.currentTarget);
					f && r.value && JS(r.value, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "year",
						value: r.value,
						focus: t
					});
				} : void 0
			});
		},
		getNextTriggerProps(e = {}) {
			let { view: n = "day" } = e, r = m || !o("isNextVisibleRangeValid");
			return t.button({
				...Q.nextTrigger.attrs,
				dir: i("dir"),
				id: aE(s, n),
				type: "button",
				"aria-label": ae.nextTrigger(n),
				disabled: r,
				"data-disabled": K(r),
				onClick(e) {
					e.defaultPrevented || a({
						type: "GOTO.NEXT",
						view: n
					});
				}
			});
		},
		getPrevTriggerProps(e = {}) {
			let { view: n = "day" } = e, r = m || !o("isPrevVisibleRangeValid");
			return t.button({
				...Q.prevTrigger.attrs,
				dir: i("dir"),
				id: iE(s, n),
				type: "button",
				"aria-label": ae.prevTrigger(n),
				disabled: r,
				"data-disabled": K(r),
				onClick(e) {
					e.defaultPrevented || a({
						type: "GOTO.PREV",
						view: n
					});
				}
			});
		},
		getClearTriggerProps() {
			return t.button({
				...Q.clearTrigger.attrs,
				id: sE(s),
				dir: i("dir"),
				type: "button",
				"aria-label": ae.clearTrigger,
				hidden: !u.length,
				onClick(e) {
					e.defaultPrevented || a({ type: "VALUE.CLEAR" });
				}
			});
		},
		getTriggerProps() {
			return t.button({
				...Q.trigger.attrs,
				id: uE(s),
				dir: i("dir"),
				type: "button",
				"data-placement": ne,
				"data-side": re,
				"aria-label": ae.trigger(T),
				"aria-controls": nE(s),
				"aria-expanded": T,
				"data-state": T ? "open" : "closed",
				"data-placeholder-shown": K(v),
				"aria-haspopup": "grid",
				disabled: m,
				onClick(e) {
					e.defaultPrevented || _ && a({ type: "TRIGGER.CLICK" });
				}
			});
		},
		getViewProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...Q.view.attrs,
				"data-view": n,
				hidden: r.get("view") !== n
			});
		},
		getViewTriggerProps(e = {}) {
			let { view: n = "day" } = e;
			return t.button({
				...Q.viewTrigger.attrs,
				"data-view": n,
				dir: i("dir"),
				id: oE(s, n),
				type: "button",
				disabled: m,
				"aria-label": ae.viewTrigger(n),
				onClick(e) {
					e.defaultPrevented || _ && a({
						type: "VIEW.TOGGLE",
						src: "viewTrigger"
					});
				}
			});
		},
		getViewControlProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...Q.viewControl.attrs,
				"data-view": n,
				dir: i("dir")
			});
		},
		getInputProps(e = {}) {
			let { index: n = 0, fixOnBlur: r = !0 } = e;
			return t.input({
				...Q.input.attrs,
				id: lE(s, n),
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: "false",
				dir: i("dir"),
				name: i("name"),
				"data-index": n,
				"data-state": T ? "open" : "closed",
				"data-placeholder-shown": K(v),
				readOnly: h,
				disabled: m,
				required: i("required"),
				"aria-invalid": wc(g),
				"data-invalid": K(g),
				placeholder: i("placeholder") || OE(x),
				defaultValue: o("valueAsString")[n],
				onBeforeInput(e) {
					let { data: t } = Al(e);
					zT(t, k, x) || e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || i("openOnClick") && _ && a({
						type: "OPEN",
						src: "input.click"
					});
				},
				onFocus() {
					a({
						type: "INPUT.FOCUS",
						index: n
					});
				},
				onBlur(e) {
					let t = e.currentTarget.value.trim();
					a({
						type: "INPUT.BLUR",
						value: t,
						index: n,
						fixOnBlur: r
					});
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !_) return;
					let t = { Enter(e) {
						Tl(e) || ce(d) || e.currentTarget.value.trim() !== "" && a({
							type: "INPUT.ENTER",
							value: e.currentTarget.value,
							index: n
						});
					} }[e.key];
					t && (t(e), e.preventDefault());
				},
				onInput(e) {
					let t = e.currentTarget.value;
					a({
						type: "INPUT.CHANGE",
						value: BT(t, k, x),
						index: n
					});
				}
			});
		},
		getMonthSelectProps() {
			return t.select({
				...Q.monthSelect.attrs,
				id: fE(s),
				"aria-label": ae.monthSelect,
				disabled: m,
				dir: i("dir"),
				defaultValue: c.month,
				onChange(e) {
					le(Number(e.currentTarget.value));
				}
			});
		},
		getYearSelectProps() {
			return t.select({
				...Q.yearSelect.attrs,
				id: pE(s),
				disabled: m,
				"aria-label": ae.yearSelect,
				dir: i("dir"),
				defaultValue: c.year,
				onChange(e) {
					j(Number(e.currentTarget.value));
				}
			});
		},
		getPositionerProps() {
			return t.element({
				id: dE(s),
				...Q.positioner.attrs,
				dir: i("dir"),
				style: ie.floating
			});
		},
		getPresetTriggerProps(e) {
			let n = Array.isArray(e.value) ? e.value : XT(e.value, x, S), r = n.filter((e) => e != null).map((e) => e.toDate(S).toDateString());
			return t.button({
				...Q.presetTrigger.attrs,
				"aria-label": ae.presetTrigger(r),
				type: "button",
				onClick(e) {
					e.defaultPrevented || a({
						type: "PRESET.CLICK",
						value: n
					});
				}
			});
		}
	};
}
var WE = t((() => {
	Lw(), QT(), Y(), ob(), X(), AS(), CE(), HE();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+date-picker@1.42.0_@internationalized+date@3.12.2/node_modules/@zag-js/date-picker/dist/date-picker.machine.mjs
function GE(e, t) {
	if (e?.length !== t?.length) return !1;
	let n = Math.max(e.length, t.length);
	for (let r = 0; r < n; r++) if (!Kw(e[r], t[r])) return !1;
	return !0;
}
function KE(e, t) {
	return e.map((e) => e == null ? "" : t("format")(e, {
		locale: t("locale"),
		timeZone: t("timeZone")
	}));
}
function qE(e, t) {
	let { context: n, prop: r, computed: i } = e;
	if (!t) return;
	let a = ZE(e, t);
	if (Kw(n.get("focusedValue"), a)) return;
	let o = kT(i("visibleDuration"), r("locale"), r("min"), r("max"))({
		focusedDate: a,
		startDate: n.get("startValue")
	});
	n.set("startValue", o.startDate), n.set("focusedValue", o.focusedDate);
}
function JE(e, t) {
	let { context: n } = e;
	n.set("startValue", t.startDate), !Kw(n.get("focusedValue"), t.focusedDate) && n.set("focusedValue", t.focusedDate);
}
var YE, XE, ZE, QE, $E = t((() => {
	Lw(), um(), QT(), lx(), Y(), vS(), ob(), CE(), HE(), {and: YE} = tm(), XE = nm({
		props({ props: e }) {
			let t = e.locale || "en-US", n = e.timeZone || "UTC", r = e.selectionMode || "single", i = e.numOfMonths || 1, a;
			if (e.createCalendar) {
				let n = new Intl.DateTimeFormat(t).resolvedOptions().calendar;
				n !== "gregory" && n !== "iso8601" && (a = e.createCalendar(n));
			}
			let o = (e) => !a || e.calendar.identifier === a.identifier ? e : FC(e, a), s = e.defaultValue ? EE(e.defaultValue).map((t) => Hw(o(t), e.min, e.max)) : void 0, c = e.value ? EE(e.value).map((t) => Hw(o(t), e.min, e.max)) : void 0, l = e.focusedValue || e.defaultFocusedValue || c?.[0] || s?.[0] || DT(n, a);
			l = Hw(o(l), e.min, e.max);
			let u = "year";
			return {
				locale: t,
				numOfMonths: i,
				timeZone: n,
				selectionMode: r,
				defaultView: jE(e.view || "day", "day", u),
				minView: "day",
				maxView: u,
				outsideDaySelectable: !1,
				closeOnSelect: !0,
				format(e, { locale: t, timeZone: n }) {
					return new Mw(t, {
						timeZone: n,
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
						calendar: a?.identifier
					}).format(e.toDate(n));
				},
				parse(e, { locale: t, timeZone: n }) {
					return UT(e, t, n);
				},
				...e,
				focusedValue: e.focusedValue === void 0 ? void 0 : l,
				defaultFocusedValue: l,
				value: c,
				defaultValue: s ?? [],
				positioning: {
					placement: "bottom",
					...e.positioning
				}
			};
		},
		initialState({ prop: e }) {
			return e("open") || e("defaultOpen") || e("inline") ? "open" : "idle";
		},
		refs() {
			return { announcer: void 0 };
		},
		context({ prop: e, bindable: t, getContext: n }) {
			return {
				focusedValue: t(() => ({
					defaultValue: e("defaultFocusedValue"),
					value: e("focusedValue"),
					isEqual: Kw,
					hash: (e) => e.toString(),
					sync: !0,
					onChange(t) {
						let r = n(), i = r.get("view"), a = r.get("value"), o = KE(a, e);
						e("onFocusChange")?.({
							value: a,
							valueAsString: o,
							view: i,
							focusedValue: t
						});
					}
				})),
				value: t(() => ({
					defaultValue: e("defaultValue"),
					value: e("value"),
					isEqual: GE,
					hash: (e) => e.map((e) => e?.toString() ?? "").join(","),
					onChange(t) {
						let r = n(), i = KE(t, e);
						e("onValueChange")?.({
							value: t,
							valueAsString: i,
							view: r.get("view")
						});
					}
				})),
				inputValue: t(() => ({ defaultValue: "" })),
				activeIndex: t(() => ({
					defaultValue: 0,
					sync: !0
				})),
				hoveredValue: t(() => ({
					defaultValue: null,
					isEqual: Kw
				})),
				view: t(() => ({
					defaultValue: e("defaultView"),
					value: e("view"),
					onChange(t) {
						e("onViewChange")?.({ view: t });
					}
				})),
				startValue: t(() => ({
					defaultValue: Ww(e("focusedValue") || e("defaultFocusedValue"), "start", { months: e("numOfMonths") }, e("locale")),
					isEqual: Kw,
					hash: (e) => e.toString()
				})),
				currentPlacement: t(() => ({ defaultValue: void 0 })),
				restoreFocus: t(() => ({ defaultValue: !1 }))
			};
		},
		computed: {
			isInteractive: ({ prop: e }) => !e("disabled") && !e("readOnly"),
			visibleDuration: ({ prop: e }) => ({ months: e("numOfMonths") }),
			endValue: ({ context: e, computed: t }) => $w(e.get("startValue"), t("visibleDuration")),
			visibleRange: ({ context: e, computed: t }) => ({
				start: e.get("startValue"),
				end: t("endValue")
			}),
			visibleRangeText: ({ context: e, prop: t, computed: n }) => VE({
				view: e.get("view"),
				startValue: e.get("startValue"),
				endValue: n("endValue"),
				locale: t("locale"),
				timeZone: t("timeZone"),
				selectionMode: t("selectionMode")
			}),
			isPrevVisibleRangeValid: ({ context: e, prop: t }) => !Yw(e.get("startValue"), t("min"), t("max")),
			isNextVisibleRangeValid: ({ prop: e, computed: t }) => !Xw(t("endValue"), e("min"), e("max")),
			valueAsString: ({ context: e, prop: t }) => KE(e.get("value"), t)
		},
		effects: ["setupLiveRegion"],
		watch({ track: e, prop: t, context: n, action: r, computed: i }) {
			e([() => t("locale")], () => {
				r(["setStartValue", "syncInputElement"]);
			}), e([() => n.hash("focusedValue")], () => {
				r([
					"setStartValue",
					"focusActiveCellIfNeeded",
					"setHoveredValueIfKeyboard"
				]);
			}), e([() => n.hash("startValue")], () => {
				r([
					"syncMonthSelectElement",
					"syncYearSelectElement",
					"invokeOnVisibleRangeChange"
				]);
			}), e([() => n.get("inputValue")], () => {
				r(["syncInputValue"]);
			}), e([() => n.hash("value")], () => {
				r(["syncInputElement"]);
			}), e([() => i("valueAsString").toString()], () => {
				r(["announceValueText"]);
			}), e([() => n.get("view")], () => {
				r(["focusActiveCell"]);
			}), e([() => t("open")], () => {
				r(["toggleVisibility"]);
			});
		},
		on: {
			"VALUE.SET": { actions: ["setDateValue", "setFocusedDate"] },
			"VIEW.SET": { actions: ["setView"] },
			"FOCUS.SET": { actions: ["setFocusedDate"] },
			"VALUE.CLEAR": { actions: [
				"clearDateValue",
				"clearFocusedDate",
				"setActiveIndexToStart",
				"clearHoveredDate",
				"focusFirstInputElement"
			] },
			"INPUT.CHANGE": [{
				guard: "isInputValueEmpty",
				actions: [
					"setInputValue",
					"clearDateValue",
					"clearFocusedDate"
				]
			}, { actions: ["setInputValue", "focusParsedDate"] }],
			"INPUT.ENTER": { actions: ["focusParsedDate", "selectFocusedDate"] },
			"INPUT.FOCUS": { actions: ["setActiveIndex"] },
			"INPUT.BLUR": [{
				guard: "shouldFixOnBlur",
				actions: ["setActiveIndexToStart", "selectParsedDate"]
			}, { actions: ["setActiveIndexToStart"] }],
			"PRESET.CLICK": [{
				guard: "isOpenControlled",
				actions: [
					"setDateValue",
					"setFocusedDate",
					"invokeOnClose"
				]
			}, {
				target: "focused",
				actions: [
					"setDateValue",
					"setFocusedDate",
					"focusInputElement"
				]
			}],
			"GOTO.NEXT": [
				{
					guard: "isYearView",
					actions: ["focusNextDecade", "announceVisibleRange"]
				},
				{
					guard: "isMonthView",
					actions: ["focusNextYear", "announceVisibleRange"]
				},
				{ actions: ["focusNextPage"] }
			],
			"GOTO.PREV": [
				{
					guard: "isYearView",
					actions: ["focusPreviousDecade", "announceVisibleRange"]
				},
				{
					guard: "isMonthView",
					actions: ["focusPreviousYear", "announceVisibleRange"]
				},
				{ actions: ["focusPreviousPage"] }
			]
		},
		states: {
			idle: {
				tags: ["closed"],
				on: {
					"CONTROLLED.OPEN": {
						target: "open",
						actions: [
							"resetView",
							"focusFirstSelectedDate",
							"focusActiveCell"
						]
					},
					"TRIGGER.CLICK": [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"resetView",
							"focusFirstSelectedDate",
							"focusActiveCell",
							"invokeOnOpen"
						]
					}],
					OPEN: [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"resetView",
							"focusFirstSelectedDate",
							"focusActiveCell",
							"invokeOnOpen"
						]
					}]
				}
			},
			focused: {
				tags: ["closed"],
				on: {
					"CONTROLLED.OPEN": {
						target: "open",
						actions: [
							"resetView",
							"focusFirstSelectedDate",
							"focusActiveCell"
						]
					},
					"TRIGGER.CLICK": [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"resetView",
							"focusFirstSelectedDate",
							"focusActiveCell",
							"invokeOnOpen"
						]
					}],
					OPEN: [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"resetView",
							"focusFirstSelectedDate",
							"focusActiveCell",
							"invokeOnOpen"
						]
					}]
				}
			},
			open: {
				tags: ["open"],
				effects: ["trackDismissableElement", "trackPositioning"],
				exit: ["clearHoveredDate"],
				on: {
					"CONTROLLED.CLOSE": [
						{
							guard: YE("shouldRestoreFocus", "isInteractOutsideEvent"),
							target: "focused",
							actions: ["focusTriggerElement"]
						},
						{
							guard: "shouldRestoreFocus",
							target: "focused",
							actions: ["focusInputElement"]
						},
						{ target: "idle" }
					],
					"CELL.CLICK": [
						{
							guard: "isAboveMinView",
							actions: ["setFocusedValueForView", "setPreviousView"]
						},
						{
							guard: YE("isRangePicker", "hasSelectedRange"),
							actions: [
								"setActiveIndexToStart",
								"resetSelection",
								"setActiveIndexToEnd"
							]
						},
						{
							guard: YE("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
							actions: [
								"setFocusedDate",
								"setSelectedDate",
								"setActiveIndexToStart",
								"clearHoveredDate",
								"invokeOnClose",
								"setRestoreFocus"
							]
						},
						{
							guard: YE("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
							target: "focused",
							actions: [
								"setFocusedDate",
								"setSelectedDate",
								"setActiveIndexToStart",
								"clearHoveredDate",
								"invokeOnClose",
								"focusInputElement"
							]
						},
						{
							guard: YE("isRangePicker", "isSelectingEndDate"),
							actions: [
								"setFocusedDate",
								"setSelectedDate",
								"setActiveIndexToStart",
								"clearHoveredDate"
							]
						},
						{
							guard: "isRangePicker",
							actions: [
								"setFocusedDate",
								"setSelectedDate",
								"setActiveIndexToEnd"
							]
						},
						{
							guard: YE("isMultiPicker", "canSelectDate"),
							actions: ["setFocusedDate", "toggleSelectedDate"]
						},
						{
							guard: "isMultiPicker",
							actions: ["setFocusedDate"]
						},
						{
							guard: YE("closeOnSelect", "isOpenControlled"),
							actions: [
								"setFocusedDate",
								"setSelectedDate",
								"invokeOnClose"
							]
						},
						{
							guard: "closeOnSelect",
							target: "focused",
							actions: [
								"setFocusedDate",
								"setSelectedDate",
								"invokeOnClose",
								"focusInputElement"
							]
						},
						{ actions: ["setFocusedDate", "setSelectedDate"] }
					],
					"CELL.POINTER_MOVE": [{
						guard: YE("isRangePicker", "isSelectingEndDate", "isDayPointerMoveOutsideVisibleMonth"),
						actions: ["setHoveredDate"]
					}, {
						guard: YE("isRangePicker", "isSelectingEndDate"),
						actions: ["setHoveredDate", "setFocusedDate"]
					}],
					"TABLE.POINTER_LEAVE": {
						guard: "isRangePicker",
						actions: ["clearHoveredDate"]
					},
					"TABLE.POINTER_DOWN": { actions: ["disableTextSelection"] },
					"TABLE.POINTER_UP": { actions: ["enableTextSelection"] },
					"TABLE.ESCAPE": [{
						guard: "isOpenControlled",
						actions: ["focusFirstSelectedDate", "invokeOnClose"]
					}, {
						target: "focused",
						actions: [
							"focusFirstSelectedDate",
							"invokeOnClose",
							"focusTriggerElement"
						]
					}],
					"TABLE.ENTER": [
						{
							guard: "isAboveMinView",
							actions: ["setPreviousView"]
						},
						{
							guard: YE("isRangePicker", "hasSelectedRange"),
							actions: [
								"setActiveIndexToStart",
								"clearDateValue",
								"setSelectedDate",
								"setActiveIndexToEnd"
							]
						},
						{
							guard: YE("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
							actions: [
								"setSelectedDate",
								"setActiveIndexToStart",
								"clearHoveredDate",
								"invokeOnClose"
							]
						},
						{
							guard: YE("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
							target: "focused",
							actions: [
								"setSelectedDate",
								"setActiveIndexToStart",
								"clearHoveredDate",
								"invokeOnClose",
								"focusInputElement"
							]
						},
						{
							guard: YE("isRangePicker", "isSelectingEndDate"),
							actions: [
								"setSelectedDate",
								"setActiveIndexToStart",
								"clearHoveredDate"
							]
						},
						{
							guard: "isRangePicker",
							actions: [
								"setSelectedDate",
								"setActiveIndexToEnd",
								"focusNextDay"
							]
						},
						{
							guard: YE("isMultiPicker", "canSelectDate"),
							actions: ["toggleSelectedDate"]
						},
						{ guard: "isMultiPicker" },
						{
							guard: YE("closeOnSelect", "isOpenControlled"),
							actions: ["selectFocusedDate", "invokeOnClose"]
						},
						{
							guard: "closeOnSelect",
							target: "focused",
							actions: [
								"selectFocusedDate",
								"invokeOnClose",
								"focusInputElement"
							]
						},
						{ actions: ["selectFocusedDate"] }
					],
					"TABLE.ARROW_RIGHT": [
						{
							guard: "isMonthView",
							actions: ["focusNextMonth"]
						},
						{
							guard: "isYearView",
							actions: ["focusNextYear"]
						},
						{ actions: ["focusNextDay", "setHoveredDate"] }
					],
					"TABLE.ARROW_LEFT": [
						{
							guard: "isMonthView",
							actions: ["focusPreviousMonth"]
						},
						{
							guard: "isYearView",
							actions: ["focusPreviousYear"]
						},
						{ actions: ["focusPreviousDay"] }
					],
					"TABLE.ARROW_UP": [
						{
							guard: "isMonthView",
							actions: ["focusPreviousMonthColumn"]
						},
						{
							guard: "isYearView",
							actions: ["focusPreviousYearColumn"]
						},
						{ actions: ["focusPreviousWeek"] }
					],
					"TABLE.ARROW_DOWN": [
						{
							guard: "isMonthView",
							actions: ["focusNextMonthColumn"]
						},
						{
							guard: "isYearView",
							actions: ["focusNextYearColumn"]
						},
						{ actions: ["focusNextWeek"] }
					],
					"TABLE.PAGE_UP": { actions: ["focusPreviousSection"] },
					"TABLE.PAGE_DOWN": { actions: ["focusNextSection"] },
					"TABLE.HOME": [
						{
							guard: "isMonthView",
							actions: ["focusFirstMonth"]
						},
						{
							guard: "isYearView",
							actions: ["focusFirstYear"]
						},
						{ actions: ["focusSectionStart"] }
					],
					"TABLE.END": [
						{
							guard: "isMonthView",
							actions: ["focusLastMonth"]
						},
						{
							guard: "isYearView",
							actions: ["focusLastYear"]
						},
						{ actions: ["focusSectionEnd"] }
					],
					"TRIGGER.CLICK": [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose"]
					}, {
						target: "focused",
						actions: ["invokeOnClose"]
					}],
					"VIEW.TOGGLE": { actions: ["setNextView"] },
					INTERACT_OUTSIDE: [
						{
							guard: "isOpenControlled",
							actions: ["setActiveIndexToStart", "invokeOnClose"]
						},
						{
							guard: "shouldRestoreFocus",
							target: "focused",
							actions: [
								"setActiveIndexToStart",
								"invokeOnClose",
								"focusTriggerElement"
							]
						},
						{
							target: "idle",
							actions: ["setActiveIndexToStart", "invokeOnClose"]
						}
					],
					CLOSE: [{
						guard: "isOpenControlled",
						actions: ["setActiveIndexToStart", "invokeOnClose"]
					}, {
						target: "idle",
						actions: ["setActiveIndexToStart", "invokeOnClose"]
					}]
				}
			}
		},
		implementations: {
			guards: {
				isAboveMinView: ({ context: e, prop: t }) => ME(e.get("view"), t("minView")),
				isDayView: ({ context: e, event: t }) => (t.view || e.get("view")) === "day",
				isMonthView: ({ context: e, event: t }) => (t.view || e.get("view")) === "month",
				isYearView: ({ context: e, event: t }) => (t.view || e.get("view")) === "year",
				isRangePicker: ({ prop: e }) => e("selectionMode") === "range",
				hasSelectedRange: ({ context: e }) => e.get("value").length === 2,
				isMultiPicker: ({ prop: e }) => e("selectionMode") === "multiple",
				canSelectDate: ({ context: e, prop: t, event: n }) => {
					let r = t("maxSelectedDates");
					if (r == null) return !0;
					let i = e.get("value"), a = n.value ?? e.get("focusedValue");
					return i.some((e) => Kw(e, a)) ? !0 : i.length < r;
				},
				shouldRestoreFocus: ({ context: e }) => !!e.get("restoreFocus"),
				isSelectingEndDate: ({ context: e }) => e.get("activeIndex") === 1,
				closeOnSelect: ({ prop: e }) => !!e("closeOnSelect"),
				isOpenControlled: ({ prop: e }) => e("open") != null || !!e("inline"),
				isInteractOutsideEvent: ({ event: e }) => e.previousEvent?.type === "INTERACT_OUTSIDE",
				isInputValueEmpty: ({ event: e }) => e.value.trim() === "",
				shouldFixOnBlur: ({ event: e }) => !!e.fixOnBlur,
				isDayPointerMoveOutsideVisibleMonth: ({ event: e }) => e.cell === "day" && e.outsideRange === !0
			},
			effects: {
				trackPositioning({ context: e, prop: t, scope: n }) {
					return t("inline") ? void 0 : (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), Qy(SE(n), () => xE(n), {
						...t("positioning"),
						defer: !0,
						onComplete(t) {
							e.set("currentPlacement", t.placement);
						}
					}));
				},
				setupLiveRegion({ scope: e, refs: t }) {
					let n = e.getDoc();
					return t.set("announcer", mS({
						level: "assertive",
						document: n
					})), () => t.get("announcer")?.destroy?.();
				},
				trackDismissableElement({ scope: e, send: t, context: n, prop: r }) {
					return r("inline") ? void 0 : sx(() => gE(e), {
						type: "popover",
						defer: !0,
						layerStyleTargets: [() => xE(e)],
						exclude: [
							..._E(e),
							hE(e),
							bE(e)
						],
						onInteractOutside(e) {
							n.set("restoreFocus", !e.detail.focusable);
						},
						onDismiss() {
							t({ type: "INTERACT_OUTSIDE" });
						},
						onEscapeKeyDown(e) {
							e.preventDefault(), t({
								type: "TABLE.ESCAPE",
								src: "dismissable"
							});
						}
					});
				}
			},
			actions: {
				setNextView({ context: e, prop: t }) {
					let n = PE(e.get("view"), t("minView"), t("maxView"));
					e.set("view", n);
				},
				setPreviousView({ context: e, prop: t }) {
					let n = FE(e.get("view"), t("minView"), t("maxView"));
					e.set("view", n);
				},
				setView({ context: e, event: t }) {
					e.set("view", t.view);
				},
				setRestoreFocus({ context: e }) {
					e.set("restoreFocus", !0);
				},
				announceValueText({ context: e, prop: t, refs: n }) {
					let r = e.get("value"), i = t("locale"), a = t("timeZone"), o;
					if (t("selectionMode") === "range") {
						let [e, t] = r;
						o = e && t ? sT(e, t, i, a) : e ? sT(e, null, i, a) : t ? sT(t, null, i, a) : "";
					} else o = r.map((e) => sT(e, null, i, a)).filter(Boolean).join(",");
					n.get("announcer")?.announce(o, 3e3);
				},
				announceVisibleRange({ computed: e, refs: t }) {
					let { formatted: n } = e("visibleRangeText");
					t.get("announcer")?.announce(n);
				},
				disableTextSelection({ scope: e }) {
					Bu({
						target: gE(e),
						doc: e.getDoc()
					});
				},
				enableTextSelection({ scope: e }) {
					zu({
						doc: e.getDoc(),
						target: gE(e)
					});
				},
				focusFirstSelectedDate(e) {
					let { context: t } = e;
					t.get("value").length && qE(e, t.get("value")[0]);
				},
				syncInputElement({ scope: e, computed: t }) {
					J(() => {
						_E(e).forEach((e, n) => {
							Wl(e, t("valueAsString")[n] || "");
						});
					});
				},
				setFocusedDate(e) {
					let { event: t } = e;
					qE(e, Array.isArray(t.value) ? t.value[0] : t.value);
				},
				setFocusedValueForView(e) {
					let { context: t, event: n } = e;
					qE(e, t.get("focusedValue").set({ [t.get("view")]: n.value }));
				},
				focusNextMonth(e) {
					let { context: t } = e;
					qE(e, t.get("focusedValue").add({ months: 1 }));
				},
				focusPreviousMonth(e) {
					let { context: t } = e;
					qE(e, t.get("focusedValue").subtract({ months: 1 }));
				},
				setDateValue({ context: e, event: t, prop: n }) {
					if (!Array.isArray(t.value)) return;
					let r = t.value.map((e) => Hw(e, n("min"), n("max")));
					e.set("value", r);
				},
				clearDateValue({ context: e }) {
					e.set("value", []);
				},
				setSelectedDate(e) {
					let { context: t, event: n } = e, r = Array.from(t.get("value")), i = t.get("activeIndex"), a = r[i];
					r[i] = QE(a, ZE(e, n.value ?? t.get("focusedValue"))), t.set("value", wE(r));
				},
				resetSelection(e) {
					let { context: t, event: n } = e, r = t.get("value")[0], i = ZE(e, n.value ?? t.get("focusedValue"));
					t.set("value", [QE(r, i)]);
				},
				toggleSelectedDate(e) {
					let { context: t, event: n } = e, r = ZE(e, n.value ?? t.get("focusedValue")), i = t.get("value"), a = i.findIndex((e) => Kw(e, r));
					if (a === -1) {
						let e = [...i, r];
						t.set("value", EE(e));
					} else {
						let e = Array.from(i);
						e.splice(a, 1), t.set("value", EE(e));
					}
				},
				setHoveredDate({ context: e, event: t }) {
					e.set("hoveredValue", t.value);
				},
				clearHoveredDate({ context: e }) {
					e.set("hoveredValue", null);
				},
				selectFocusedDate({ context: e, computed: t }) {
					let n = Array.from(e.get("value")), r = e.get("activeIndex"), i = n[r];
					n[r] = QE(i, e.get("focusedValue").copy()), e.set("value", wE(n));
					let a = t("valueAsString");
					e.set("inputValue", a[r]);
				},
				focusPreviousDay(e) {
					let { context: t } = e;
					qE(e, t.get("focusedValue").subtract({ days: 1 }));
				},
				focusNextDay(e) {
					let { context: t } = e;
					qE(e, t.get("focusedValue").add({ days: 1 }));
				},
				focusPreviousWeek(e) {
					let { context: t } = e;
					qE(e, t.get("focusedValue").subtract({ weeks: 1 }));
				},
				focusNextWeek(e) {
					let { context: t } = e;
					qE(e, t.get("focusedValue").add({ weeks: 1 }));
				},
				focusNextPage(e) {
					let { context: t, computed: n, prop: r } = e;
					JE(e, AT(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
				},
				focusPreviousPage(e) {
					let { context: t, computed: n, prop: r } = e;
					JE(e, jT(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
				},
				focusSectionStart(e) {
					let { context: t } = e;
					qE(e, t.get("startValue").copy());
				},
				focusSectionEnd(e) {
					let { computed: t } = e;
					qE(e, t("endValue").copy());
				},
				focusNextSection(e) {
					let { context: t, event: n, computed: r, prop: i } = e, a = MT(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
					a && JE(e, a);
				},
				focusPreviousSection(e) {
					let { context: t, event: n, computed: r, prop: i } = e, a = NT(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
					a && JE(e, a);
				},
				focusNextYear(e) {
					let { context: t } = e;
					qE(e, t.get("focusedValue").add({ years: 1 }));
				},
				focusPreviousYear(e) {
					let { context: t } = e;
					qE(e, t.get("focusedValue").subtract({ years: 1 }));
				},
				focusNextDecade(e) {
					let { context: t } = e;
					qE(e, t.get("focusedValue").add({ years: 10 }));
				},
				focusPreviousDecade(e) {
					let { context: t } = e;
					qE(e, t.get("focusedValue").subtract({ years: 10 }));
				},
				clearFocusedDate(e) {
					let { context: t, prop: n } = e, r = t.get("focusedValue").calendar;
					qE(e, DT(n("timeZone"), r));
				},
				focusPreviousMonthColumn(e) {
					let { context: t, event: n } = e;
					qE(e, t.get("focusedValue").subtract({ months: n.columns }));
				},
				focusNextMonthColumn(e) {
					let { context: t, event: n } = e;
					qE(e, t.get("focusedValue").add({ months: n.columns }));
				},
				focusPreviousYearColumn(e) {
					let { context: t, event: n } = e;
					qE(e, t.get("focusedValue").subtract({ years: n.columns }));
				},
				focusNextYearColumn(e) {
					let { context: t, event: n } = e;
					qE(e, t.get("focusedValue").add({ years: n.columns }));
				},
				focusFirstMonth(e) {
					let { context: t } = e, n = t.get("focusedValue"), r = n.calendar.getMinimumMonthInYear?.(n) ?? 1;
					qE(e, n.set({ month: r }));
				},
				focusLastMonth(e) {
					let { context: t } = e, n = t.get("focusedValue"), r = n.calendar.getMonthsInYear(n);
					qE(e, n.set({ month: r }));
				},
				focusFirstYear(e) {
					let { context: t } = e, n = ST(t.get("focusedValue").year);
					qE(e, t.get("focusedValue").set({ year: n[0] }));
				},
				focusLastYear(e) {
					let { context: t } = e, n = ST(t.get("focusedValue").year);
					qE(e, t.get("focusedValue").set({ year: n[n.length - 1] }));
				},
				setActiveIndex({ context: e, event: t }) {
					e.set("activeIndex", t.index);
				},
				setActiveIndexToEnd({ context: e }) {
					e.set("activeIndex", 1);
				},
				setActiveIndexToStart({ context: e }) {
					e.set("activeIndex", 0);
				},
				focusActiveCell({ scope: e, context: t, event: n }) {
					n.src !== "input.click" && J(() => {
						let n = t.get("view");
						mE(e, n)?.focus({ preventScroll: !0 });
					});
				},
				focusActiveCellIfNeeded({ scope: e, context: t, event: n }) {
					n.focus && J(() => {
						let n = t.get("view");
						mE(e, n)?.focus({ preventScroll: !0 });
					});
				},
				setHoveredValueIfKeyboard({ context: e, event: t, prop: n }) {
					!t.type.startsWith("TABLE.ARROW") || n("selectionMode") !== "range" || e.get("activeIndex") === 0 || e.set("hoveredValue", e.get("focusedValue").copy());
				},
				focusTriggerElement({ scope: e }) {
					J(() => {
						hE(e)?.focus({ preventScroll: !0 });
					});
				},
				focusFirstInputElement({ scope: e, event: t }) {
					t.focus !== !1 && J(() => {
						let [t] = _E(e);
						(t ?? hE(e))?.focus({ preventScroll: !0 });
					});
				},
				focusInputElement({ scope: e }) {
					J(() => {
						let t = _E(e);
						if (t.length === 0) {
							hE(e)?.focus({ preventScroll: !0 });
							return;
						}
						let n = t.findLastIndex((e) => e.value !== ""), r = t[Math.max(n, 0)];
						r?.focus({ preventScroll: !0 }), r?.setSelectionRange(r.value.length, r.value.length);
					});
				},
				syncMonthSelectElement({ scope: e, context: t }) {
					Wl(yE(e), t.get("startValue").month.toString());
				},
				syncYearSelectElement({ scope: e, context: t }) {
					Wl(vE(e), t.get("startValue").year.toString());
				},
				setInputValue({ context: e, event: t }) {
					e.get("activeIndex") === t.index && e.set("inputValue", t.value);
				},
				syncInputValue({ scope: e, context: t, event: n }) {
					queueMicrotask(() => {
						Wl(_E(e)[n.index ?? t.get("activeIndex")], t.get("inputValue"));
					});
				},
				focusParsedDate(e) {
					let { event: t, prop: n } = e;
					if (t.index == null) return;
					let r = n("parse")(t.value, {
						locale: n("locale"),
						timeZone: n("timeZone")
					});
					!r || !RE(r) || qE(e, r);
				},
				selectParsedDate({ context: e, event: t, prop: n }) {
					if (t.index == null) return;
					let r = n("parse")(t.value, {
						locale: n("locale"),
						timeZone: n("timeZone")
					});
					if ((!r || !RE(r)) && t.value && (r = e.get("focusedValue").copy()), !r) return;
					r = Hw(r, n("min"), n("max"));
					let i = Array.from(e.get("value"));
					i[t.index] = QE(i[t.index], r);
					let a = wE(i);
					e.set("value", a);
					let o = KE(a, n);
					e.set("inputValue", o[t.index]);
				},
				resetView({ context: e }) {
					e.set("view", e.initial("view"));
				},
				setStartValue({ context: e, computed: t, prop: n }) {
					let r = e.get("focusedValue");
					if (!Jw(r, e.get("startValue"), t("endValue"))) return;
					let i = Ww(r, "start", { months: n("numOfMonths") }, n("locale"));
					e.set("startValue", i);
				},
				invokeOnOpen({ prop: e, context: t }) {
					e("inline") || e("onOpenChange")?.({
						open: !0,
						value: t.get("value")
					});
				},
				invokeOnClose({ prop: e, context: t }) {
					e("inline") || e("onOpenChange")?.({
						open: !1,
						value: t.get("value")
					});
				},
				invokeOnVisibleRangeChange({ prop: e, context: t, computed: n }) {
					e("onVisibleRangeChange")?.({
						view: t.get("view"),
						visibleRange: n("visibleRange")
					});
				},
				toggleVisibility({ event: e, send: t, prop: n }) {
					t({
						type: n("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
						previousEvent: e
					});
				}
			}
		}
	}), ZE = (e, t) => {
		let { context: n, prop: r } = e, i = n.get("view"), a = typeof t == "number" ? n.get("focusedValue").set({ [i]: t }) : t;
		return IE((e) => {
			NE(e, r("minView")) && (a = a.set({ [e]: +(e === "day") }));
		}), a;
	}, QE = (e, t) => {
		if (!e || !("hour" in e)) return t;
		let n = "timeZone" in e, r = t;
		return "hour" in t || (r = n ? IC(PC(t), e.timeZone) : PC(t)), r.set({
			hour: e.hour,
			minute: e.minute,
			second: e.second,
			millisecond: e.millisecond
		});
	};
})), eD = t((() => {})), tD = t((() => {
	WE(), $E(), eD();
})), nD, rD, iD = t((() => {
	lc(), nD = ac("file-upload").parts("root", "dropzone", "item", "itemDeleteTrigger", "itemGroup", "itemName", "itemPreview", "itemPreviewImage", "itemSizeText", "label", "trigger", "clearTrigger"), rD = nD.build();
})), aD, oD, sD, cD, lD, uD, dD = t((() => {
	aD = (e) => typeof e.getAsEntry == "function" ? e.getAsEntry() : typeof e.webkitGetAsEntry == "function" ? e.webkitGetAsEntry() : null, oD = (e) => e.isDirectory, sD = (e) => e.isFile, cD = (e, t) => (Object.defineProperty(e, "relativePath", { value: t ? `${t}/${e.name}` : e.name }), e), lD = (e, t) => Promise.all(Array.from(e).filter((e) => e.kind === "file").map((e) => {
		let n = aD(e);
		if (!n) return null;
		if (oD(n) && t) return uD(n.createReader(), `${n.name}`);
		if (sD(n) && typeof e.getAsFile == "function") {
			let t = e.getAsFile();
			return Promise.resolve(t ? cD(t, "") : null);
		}
		if (sD(n)) return new Promise((e) => {
			n.file((t) => {
				e(cD(t, ""));
			});
		});
	}).filter((e) => e)), uD = (e, t = "") => new Promise((n) => {
		let r = [], i = () => {
			e.readEntries((e) => {
				if (e.length === 0) {
					n(Promise.all(r).then((e) => e.flat()));
					return;
				}
				let a = e.map((e) => {
					if (!e) return null;
					if (oD(e)) return uD(e.createReader(), `${t}${e.name}`);
					if (sD(e)) return new Promise((n) => {
						e.file((e) => {
							n(cD(e, t));
						});
					});
				}).filter((e) => e);
				r.push(Promise.all(a)), i();
			});
		};
		i();
	});
})), fD = t((() => {})), pD = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+file-utils@1.42.0/node_modules/@zag-js/file-utils/dist/get-accept-attr.mjs
function mD(e) {
	return e === "audio/*" || e === "video/*" || e === "image/*" || e === "text/*" || /\w+\/[-+.\w]+/g.test(e);
}
function hD(e) {
	return /^.*\.[\w]+$/.test(e);
}
function gD(e) {
	if (e != null) return typeof e == "string" ? e : Array.isArray(e) ? e.filter(_D).join(",") : Object.entries(e).reduce((e, [t, n]) => [
		...e,
		t,
		...n
	], []).filter(_D).join(",");
}
var _D, vD = t((() => {
	_D = (e) => mD(e) || hD(e);
})), yD = t((() => {})), bD = t((() => {})), xD, SD = t((() => {
	xD = (e, t) => e.name === t.name && e.size === t.size && e.type === t.type;
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+file-utils@1.42.0/node_modules/@zag-js/file-utils/dist/is-valid-file-size.mjs
function CD(e, t, n) {
	if (wD(e.size)) {
		if (wD(t) && wD(n)) {
			if (e.size > n) return [!1, "FILE_TOO_LARGE"];
			if (e.size < t) return [!1, "FILE_TOO_SMALL"];
		} else if (wD(t) && e.size < t) return [!1, "FILE_TOO_SMALL"];
		else if (wD(n) && e.size > n) return [!1, "FILE_TOO_LARGE"];
	}
	return [!0, null];
}
var wD, TD = t((() => {
	wD = (e) => e != null;
})), ED, DD, OD = t((() => {
	ED = "3g2_video/3gpp2[3gp,3gpp_video/3gpp[3mf_model/3mf[7z_application/x-7z-compressed[aac_audio/aac[ac_application/pkix-attr-cert[adp_audio/adpcm[adts_audio/aac[ai_application/postscript[aml_application/automationml-aml+xml[amlx_application/automationml-amlx+zip[amr_audio/amr[apk_application/vnd.android.package-archive[apng_image/apng[appcache,manifest_text/cache-manifest[appinstaller_application/appinstaller[appx_application/appx[appxbundle_application/appxbundle[asc_application/pgp-keys[atom_application/atom+xml[atomcat_application/atomcat+xml[atomdeleted_application/atomdeleted+xml[atomsvc_application/atomsvc+xml[au,snd_audio/basic[avi_video/x-msvideo[avci_image/avci[avcs_image/avcs[avif_image/avif[aw_application/applixware[bdoc_application/bdoc[bin,bpk,buffer,deb,deploy,dist,distz,dll,dmg,dms,dump,elc,exe,img,iso,lrf,mar,msi,msm,msp,pkg,so_application/octet-stream[bmp,dib_image/bmp[btf,btif_image/prs.btif[bz2_application/x-bzip2[c_text/x-c[ccxml_application/ccxml+xml[cdfx_application/cdfx+xml[cdmia_application/cdmi-capability[cdmic_application/cdmi-container[cdmid_application/cdmi-domain[cdmio_application/cdmi-object[cdmiq_application/cdmi-queue[cer_application/pkix-cert[cgm_image/cgm[cjs_application/node[class_application/java-vm[coffee,litcoffee_text/coffeescript[conf,def,in,ini,list,log,text,txt_text/plain[cpp,cxx,cc_text/x-c++src[cpl_application/cpl+xml[cpt_application/mac-compactpro[crl_application/pkix-crl[css_text/css[csv_text/csv[cu_application/cu-seeme[cwl_application/cwl[cww_application/prs.cww[davmount_application/davmount+xml[dbk_application/docbook+xml[doc_application/msword[docx_application/vnd.openxmlformats-officedocument.wordprocessingml.document[dsc_text/prs.lines.tag[dssc_application/dssc+der[dtd_application/xml-dtd[dwd_application/atsc-dwd+xml[ear,jar,war_application/java-archive[ecma_application/ecmascript[emf_image/emf[eml,mime_message/rfc822[emma_application/emma+xml[emotionml_application/emotionml+xml[eot_application/vnd.ms-fontobject[eps,ps_application/postscript[epub_application/epub+zip[exi_application/exi[exp_application/express[exr_image/aces[ez_application/andrew-inset[fdf_application/fdf[fdt_application/fdt+xml[fits_image/fits[flac_audio/flac[flv_video/x-flv[g3_image/g3fax[geojson_application/geo+json[gif_image/gif[glb_model/gltf-binary[gltf_model/gltf+json[gml_application/gml+xml[go_text/x-go[gpx_application/gpx+xml[gz_application/gzip[h_text/x-h[h261_video/h261[h263_video/h263[h264_video/h264[heic_image/heic[heics_image/heic-sequence[heif_image/heif[heifs_image/heif-sequence[htm,html,shtml_text/html[ico_image/x-icon[icns_image/x-icns[ics,ifb_text/calendar[iges,igs_model/iges[ink,inkml_application/inkml+xml[ipa_application/octet-stream[java_text/x-java-source[jp2,jpg2_image/jp2[jpeg,jpe,jpg_image/jpeg[jpf,jpx_image/jpx[jpm,jpgm_image/jpm[jpgv_video/jpeg[jph_image/jph[js,mjs_text/javascript[json_application/json[json5_application/json5[jsonld_application/ld+json[jsx_text/jsx[jxl_image/jxl[jxr_image/jxr[ktx_image/ktx[ktx2_image/ktx2[less_text/less[m1v,m2v,mpe,mpeg,mpg_video/mpeg[m4a_audio/mp4[m4v_video/x-m4v[md,markdown_text/markdown[mid,midi,kar,rmi_audio/midi[mkv_video/x-matroska[mp2,mp2a,mp3,mpga,m3a,m2a_audio/mpeg[mp4,mp4v,mpg4_video/mp4[mp4a_audio/mp4[mp4s,m4p_application/mp4[odp_application/vnd.oasis.opendocument.presentation[oda_application/oda[ods_application/vnd.oasis.opendocument.spreadsheet[odt_application/vnd.oasis.opendocument.text[oga,ogg,opus,spx_audio/ogg[ogv_video/ogg[ogx_application/ogg[otf_font/otf[p12,pfx_application/x-pkcs12[pdf_application/pdf[pem_application/x-pem-file[php_text/x-php[png_image/png[ppt_application/vnd.ms-powerpoint[pptx_application/vnd.openxmlformats-officedocument.presentationml.presentation[pskcxml_application/pskc+xml[psd_image/vnd.adobe.photoshop[py_text/x-python[qt,mov_video/quicktime[rar_application/vnd.rar[rdf_application/rdf+xml[rtf_text/rtf[sass_text/x-sass[scss_text/x-scss[sgm,sgml_text/sgml[sh_application/x-sh[svg,svgz_image/svg+xml[swf_application/x-shockwave-flash[tar_application/x-tar[tif,tiff_image/tiff[toml_application/toml[ts_video/mp2t[tsx_text/tsx[tsv_text/tab-separated-values[ttc_font/collection[ttf_font/ttf[vtt_text/vtt[wasm_application/wasm[wav_audio/wav[weba_audio/webm[webm_video/webm[webmanifest_application/manifest+json[webp_image/webp[wma_audio/x-ms-wma[wmv_video/x-ms-wmv[woff_font/woff[woff2_font/woff2[xls_application/vnd.ms-excel[xlsx_application/vnd.openxmlformats-officedocument.spreadsheetml.sheet[xml_application/xml[xz_application/x-xz[yaml,yml_text/yaml[zip_application/zip", DD = new Map(ED.split("[").flatMap((e) => {
		let [t, n] = e.split("_");
		return t.split(",").map((e) => [e, n]);
	}));
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+file-utils@1.42.0/node_modules/@zag-js/file-utils/dist/get-file-mime-type.mjs
function kD(e) {
	let t = e.split(".").pop();
	return t && DD.get(t) || null;
}
var AD = t((() => {
	OD();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+file-utils@1.42.0/node_modules/@zag-js/file-utils/dist/is-valid-file-type.mjs
function jD(e, t) {
	if (e && t) {
		let n = Array.isArray(t) ? t : typeof t == "string" ? t.split(",") : [];
		if (n.length === 0) return !0;
		let r = e.name || "", i = (e.type || kD(r) || "").toLowerCase(), a = i.replace(/\/.*$/, "");
		return n.some((e) => {
			let t = e.trim().toLowerCase();
			return t.charAt(0) === "." ? r.toLowerCase().endsWith(t) : t.endsWith("/*") ? a === t.replace(/\/.*$/, "") : i === t;
		});
	}
	return !0;
}
function MD(e, t) {
	let n = e.type === "application/x-moz-file" || jD(e, t);
	return [n, n ? null : "FILE_INVALID_TYPE"];
}
var ND = t((() => {
	AD();
})), PD = t((() => {
	dD(), fD(), pD(), vD(), yD(), bD(), SD(), TD(), ND(), AD();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+i18n-utils@1.42.0/node_modules/@zag-js/i18n-utils/dist/cache.mjs
function FD(e) {
	let t = /* @__PURE__ */ new Map();
	return function(n, r) {
		let i = n + (r ? Object.entries(r).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
		if (t.has(i)) return t.get(i);
		let a = new e(n, r);
		return t.set(i, a), a;
	};
}
var ID = t((() => {})), LD = t((() => {})), RD = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+i18n-utils@1.42.0/node_modules/@zag-js/i18n-utils/dist/format-number.mjs
function zD(e, t, n = {}) {
	return BD(t, n).format(e);
}
var BD, VD = t((() => {
	ID(), BD = FD(Intl.NumberFormat);
})), HD, UD, WD, GD = t((() => {
	VD(), HD = [
		"",
		"kilo",
		"mega",
		"giga",
		"tera"
	], UD = [
		"",
		"kilo",
		"mega",
		"giga",
		"tera",
		"peta"
	], WD = (e, t = "en-US", n = {}) => {
		if (Number.isNaN(e)) return "";
		if (e === 0) return "0 B";
		let { unitSystem: r = "decimal", precision: i = 3, unit: a = "byte", unitDisplay: o = "short" } = n, s = r === "binary" ? 1024 : 1e3, c = a === "bit" ? HD : UD, l = e < 0, u = Math.abs(e), d = 0;
		for (; u >= s && d < c.length - 1;) u /= s, d++;
		let f = parseFloat(u.toPrecision(i));
		return zD(l ? -f : f, t, {
			style: "unit",
			unit: c[d] + a,
			unitDisplay: o
		});
	};
})), KD = t((() => {})), qD = t((() => {})), JD = t((() => {})), YD = t((() => {})), XD = t((() => {
	LD(), RD(), GD(), KD(), qD(), VD(), JD(), YD();
})), ZD, QD, $D, eO, tO, nO, rO, iO, aO, oO, sO, cO, lO, uO, dO = t((() => {
	X(), ZD = (e) => e.ids?.root ?? `file:${e.id}`, QD = (e) => e.ids?.dropzone ?? `file:${e.id}:dropzone`, $D = (e) => e.ids?.hiddenInput ?? `file:${e.id}:input`, eO = (e) => e.ids?.trigger ?? `file:${e.id}:trigger`, tO = (e) => e.ids?.label ?? `file:${e.id}:label`, nO = (e, t) => e.ids?.item?.(t) ?? `file:${e.id}:item:${t}`, rO = (e, t) => e.ids?.itemName?.(t) ?? `file:${e.id}:item-name:${t}`, iO = (e, t) => e.ids?.itemSizeText?.(t) ?? `file:${e.id}:item-size:${t}`, aO = (e, t) => e.ids?.itemPreview?.(t) ?? `file:${e.id}:item-preview:${t}`, oO = (e, t) => e.ids?.itemDeleteTrigger?.(t) ?? `file:${e.id}:item-delete:${t}`, sO = (e) => Tf(`${e.name}-${e.size}`), cO = (e) => e.getById(ZD(e)), lO = (e) => e.getById($D(e)), uO = (e) => e.getById(QD(e));
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+file-upload@1.42.0/node_modules/@zag-js/file-upload/dist/file-upload.utils.mjs
function fO(e) {
	let t = Sl(e);
	return e.dataTransfer ? e.dataTransfer.types.some((e) => e === "Files" || e === "application/x-moz-file") : !!t && "files" in t;
}
function pO(e, t, n) {
	let { prop: r, computed: i } = e;
	return !i("multiple") && t > 1 ? !1 : !i("multiple") && t + n.length === 2 || !(t + n.length > r("maxFiles"));
}
function mO(e, t, n = [], r = []) {
	let { prop: i, computed: a } = e, o = [], s = [], c = {
		acceptedFiles: n,
		rejectedFiles: r
	};
	return t.forEach((e) => {
		let [t, r] = MD(e, a("acceptAttr")), [l, u] = CD(e, i("minFileSize"), i("maxFileSize")), d = n.some((t) => xD(t, e)) || o.some((t) => xD(t, e)), f = i("validate")?.(e, c), p = !f || f.length === 0;
		if (t && l && p && !d) o.push(e);
		else {
			let t = [r, u];
			d && t.push("FILE_EXISTS"), p || t.push(...f ?? []), s.push({
				file: e,
				errors: t.filter(Boolean)
			});
		}
	}), pO(e, o.length, n) || (o.forEach((e) => {
		s.push({
			file: e,
			errors: ["TOO_MANY_FILES"]
		});
	}), o.splice(0)), {
		acceptedFiles: o,
		rejectedFiles: s
	};
}
function hO(e, t) {
	let n = Mc(e);
	try {
		if ("DataTransfer" in n) {
			let r = new n.DataTransfer();
			t.forEach((e) => {
				r.items.add(e);
			}), e.files = r.files;
		}
	} catch {}
}
var gO = t((() => {
	Y(), PD();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+file-upload@1.42.0/node_modules/@zag-js/file-upload/dist/file-upload.connect.mjs
function _O(e, t) {
	if (!e || e.getAttribute("type") === "file") return !1;
	let n = e.closest(bO);
	return n != t && kc(t, n);
}
function vO(e, t) {
	let { state: n, send: r, prop: i, computed: a, scope: o, context: s } = e, c = !!i("disabled"), l = !!i("readOnly"), u = !!i("required"), d = i("allowDrop"), f = i("translations"), p = n.matches("dragging"), m = n.matches("focused") && !c, h = s.get("acceptedFiles"), g = i("maxFiles");
	return {
		dragging: p,
		focused: m,
		disabled: c,
		readOnly: l,
		transforming: s.get("transforming"),
		maxFilesReached: h.length >= g,
		remainingFiles: Math.max(0, g - h.length),
		openFilePicker() {
			c || l || r({ type: "OPEN" });
		},
		deleteFile(e, t = yO) {
			c || l || r({
				type: "FILE.DELETE",
				file: e,
				itemType: t
			});
		},
		acceptedFiles: h,
		rejectedFiles: s.get("rejectedFiles"),
		setFiles(e) {
			c || l || r({
				type: "FILES.SET",
				files: e,
				count: e.length
			});
		},
		clearRejectedFiles() {
			c || l || r({ type: "REJECTED_FILES.CLEAR" });
		},
		clearFiles() {
			c || l || r({ type: "FILES.CLEAR" });
		},
		getFileSize(e) {
			return WD(e.size, i("locale"));
		},
		createFileUrl(e, t) {
			let n = o.getWin(), r = n.URL.createObjectURL(e);
			return t(r), () => n.URL.revokeObjectURL(r);
		},
		setClipboardFiles(e) {
			if (c || l) return !1;
			let t = Array.from(e?.items ?? []).reduce((e, t) => {
				if (t.kind !== "file") return e;
				let n = t.getAsFile();
				return n ? [...e, n] : e;
			}, []);
			return t.length ? (r({
				type: "FILE.SELECT",
				files: t
			}), !0) : !1;
		},
		getRootProps() {
			return t.element({
				...rD.root.attrs,
				dir: i("dir"),
				id: ZD(o),
				"data-disabled": K(c),
				"data-readonly": K(l),
				"data-dragging": K(p)
			});
		},
		getDropzoneProps(e = {}) {
			return t.element({
				...rD.dropzone.attrs,
				dir: i("dir"),
				id: QD(o),
				tabIndex: c || l || e.disableClick ? void 0 : 0,
				role: e.disableClick ? "application" : "button",
				"aria-label": f.dropzone,
				"aria-disabled": c || l || void 0,
				"data-invalid": K(i("invalid")),
				"data-disabled": K(c),
				"data-readonly": K(l),
				"data-dragging": K(p),
				onKeyDown(t) {
					if (c || l || t.defaultPrevented) return;
					let n = Sl(t);
					kc(t.currentTarget, n) && (_O(n, t.currentTarget) || e.disableClick || t.key !== "Enter" && t.key !== " " || r({
						type: "DROPZONE.CLICK",
						src: "keydown"
					}));
				},
				onClick(t) {
					if (c || l || t.defaultPrevented || e.disableClick) return;
					let n = Sl(t);
					kc(t.currentTarget, n) && (_O(n, t.currentTarget) || (t.currentTarget.localName === "label" && t.preventDefault(), r({ type: "DROPZONE.CLICK" })));
				},
				onDragOver(e) {
					if (c || l || !d) return;
					e.preventDefault(), e.stopPropagation();
					try {
						e.dataTransfer.dropEffect = "copy";
					} catch {}
					if (!fO(e)) return;
					let t = e.dataTransfer.items.length;
					r({
						type: "DROPZONE.DRAG_OVER",
						count: t
					});
				},
				onDragLeave(e) {
					c || l || d && (kc(e.currentTarget, e.relatedTarget) || r({ type: "DROPZONE.DRAG_LEAVE" }));
				},
				onDrop(e) {
					c || l || (d && (e.preventDefault(), e.stopPropagation()), fO(e) && lD(e.dataTransfer.items, i("directory")).then((e) => {
						r({
							type: "DROPZONE.DROP",
							files: Rd(e)
						});
					}));
				},
				onFocus() {
					c || l || r({ type: "DROPZONE.FOCUS" });
				},
				onBlur() {
					c || l || r({ type: "DROPZONE.BLUR" });
				}
			});
		},
		getTriggerProps() {
			return t.button({
				...rD.trigger.attrs,
				dir: i("dir"),
				id: eO(o),
				disabled: c || l,
				"data-disabled": K(c),
				"data-readonly": K(l),
				"data-invalid": K(i("invalid")),
				type: "button",
				onClick(e) {
					c || l || (kc(uO(o), e.currentTarget) && e.stopPropagation(), r({ type: "OPEN" }));
				}
			});
		},
		getHiddenInputProps() {
			return t.input({
				id: $D(o),
				tabIndex: -1,
				disabled: c || l,
				type: "file",
				required: i("required"),
				capture: i("capture"),
				name: i("name"),
				accept: a("acceptAttr"),
				webkitdirectory: i("directory") ? "" : void 0,
				multiple: a("multiple") || i("maxFiles") > 1,
				"aria-hidden": !0,
				onClick(e) {
					e.stopPropagation(), e.currentTarget.value = "";
				},
				onInput(e) {
					if (c || l) return;
					let { files: t } = e.currentTarget;
					r({
						type: "FILE.SELECT",
						files: t ? Array.from(t) : []
					});
				},
				style: Dd
			});
		},
		getItemGroupProps(e = {}) {
			let { type: n = yO } = e;
			return t.element({
				...rD.itemGroup.attrs,
				dir: i("dir"),
				"data-disabled": K(c),
				"data-type": n
			});
		},
		getItemProps(e) {
			let { file: n, type: r = yO } = e;
			return t.element({
				...rD.item.attrs,
				dir: i("dir"),
				id: nO(o, sO(n)),
				"data-disabled": K(c),
				"data-type": r
			});
		},
		getItemNameProps(e) {
			let { file: n, type: r = yO } = e;
			return t.element({
				...rD.itemName.attrs,
				dir: i("dir"),
				id: rO(o, sO(n)),
				"data-disabled": K(c),
				"data-type": r
			});
		},
		getItemSizeTextProps(e) {
			let { file: n, type: r = yO } = e;
			return t.element({
				...rD.itemSizeText.attrs,
				dir: i("dir"),
				id: iO(o, sO(n)),
				"data-disabled": K(c),
				"data-type": r
			});
		},
		getItemPreviewProps(e) {
			let { file: n, type: r = yO } = e;
			return t.element({
				...rD.itemPreview.attrs,
				dir: i("dir"),
				id: aO(o, sO(n)),
				"data-disabled": K(c),
				"data-type": r
			});
		},
		getItemPreviewImageProps(e) {
			let { file: n, url: r, type: i = yO } = e;
			if (!n.type.startsWith("image/")) throw Error("Preview Image is only supported for image files");
			return t.img({
				...rD.itemPreviewImage.attrs,
				alt: f.itemPreview?.(n),
				src: r,
				"data-disabled": K(c),
				"data-type": i
			});
		},
		getItemDeleteTriggerProps(e) {
			let { file: n, type: a = yO } = e;
			return t.button({
				...rD.itemDeleteTrigger.attrs,
				dir: i("dir"),
				id: oO(o, sO(n)),
				type: "button",
				disabled: c || l,
				"data-disabled": K(c),
				"data-readonly": K(l),
				"data-type": a,
				"aria-label": f.deleteFile?.(n),
				onClick() {
					c || l || r({
						type: "FILE.DELETE",
						file: n,
						itemType: a
					});
				}
			});
		},
		getLabelProps() {
			return t.label({
				...rD.label.attrs,
				dir: i("dir"),
				id: tO(o),
				htmlFor: $D(o),
				"data-disabled": K(c),
				"data-required": K(u)
			});
		},
		getClearTriggerProps() {
			return t.button({
				...rD.clearTrigger.attrs,
				dir: i("dir"),
				type: "button",
				disabled: c || l,
				hidden: h.length === 0,
				"data-disabled": K(c),
				"data-readonly": K(l),
				onClick(e) {
					e.defaultPrevented || c || l || r({ type: "FILES.CLEAR" });
				}
			});
		}
	};
}
var yO, bO, xO = t((() => {
	Y(), PD(), XD(), X(), iD(), dO(), gO(), yO = "accepted", bO = "button, a[href], input:not([type='file']), select, textarea, [tabindex], [contenteditable]";
})), SO, CO = t((() => {
	um(), Y(), PD(), X(), dO(), gO(), SO = nm({
		props({ props: e }) {
			return {
				minFileSize: 0,
				maxFileSize: Infinity,
				maxFiles: 1,
				allowDrop: !0,
				preventDocumentDrop: !0,
				defaultAcceptedFiles: [],
				...e,
				translations: {
					dropzone: "dropzone",
					itemPreview: (e) => `preview of ${e.name}`,
					deleteFile: (e) => `delete file ${e.name}`,
					...e.translations
				}
			};
		},
		initialState() {
			return "idle";
		},
		context({ prop: e, bindable: t, getContext: n }) {
			return {
				acceptedFiles: t(() => ({
					defaultValue: e("defaultAcceptedFiles"),
					value: e("acceptedFiles"),
					isEqual: (e, t) => e.length === t?.length && e.every((e, n) => xD(e, t[n])),
					hash(e) {
						return e.map((e) => `${e.name}-${e.size}`).join(",");
					},
					onChange(t) {
						let r = n();
						e("onFileAccept")?.({ files: t }), e("onFileChange")?.({
							acceptedFiles: t,
							rejectedFiles: r.get("rejectedFiles")
						});
					}
				})),
				rejectedFiles: t(() => ({
					defaultValue: [],
					isEqual: (e, t) => e.length === t?.length && e.every((e, n) => xD(e.file, t[n].file)),
					onChange(t) {
						let r = n();
						e("onFileReject")?.({ files: t }), e("onFileChange")?.({
							acceptedFiles: r.get("acceptedFiles"),
							rejectedFiles: t
						});
					}
				})),
				transforming: t(() => ({ defaultValue: !1 }))
			};
		},
		computed: {
			acceptAttr: ({ prop: e }) => gD(e("accept")),
			multiple: ({ prop: e }) => e("maxFiles") > 1
		},
		watch({ track: e, context: t, action: n }) {
			e([() => t.hash("acceptedFiles")], () => {
				n(["syncInputElement"]);
			});
		},
		on: {
			"FILES.SET": { actions: ["setFiles"] },
			"FILE.SELECT": { actions: ["setEventFiles"] },
			"FILE.DELETE": { actions: ["removeFile"] },
			"FILES.CLEAR": { actions: ["clearFiles"] },
			"REJECTED_FILES.CLEAR": { actions: ["clearRejectedFiles"] }
		},
		effects: ["preventDocumentDrop"],
		states: {
			idle: { on: {
				OPEN: { actions: ["openFilePicker"] },
				"DROPZONE.CLICK": { actions: ["openFilePicker"] },
				"DROPZONE.FOCUS": { target: "focused" },
				"DROPZONE.DRAG_OVER": { target: "dragging" }
			} },
			focused: { on: {
				"DROPZONE.BLUR": { target: "idle" },
				OPEN: { actions: ["openFilePicker"] },
				"DROPZONE.CLICK": { actions: ["openFilePicker"] },
				"DROPZONE.DRAG_OVER": { target: "dragging" }
			} },
			dragging: { on: {
				"DROPZONE.DROP": {
					target: "idle",
					actions: ["setEventFiles"]
				},
				"DROPZONE.DRAG_LEAVE": { target: "idle" }
			} }
		},
		implementations: {
			effects: { preventDocumentDrop({ prop: e, scope: t }) {
				if (!e("preventDocumentDrop") || !e("allowDrop") || e("disabled")) return;
				let n = t.getDoc();
				return Cf(q(n, "dragover", (e) => {
					e?.preventDefault();
				}, !1), q(n, "drop", (e) => {
					kc(cO(t), Sl(e)) || e.preventDefault();
				}, !1));
			} },
			actions: {
				syncInputElement({ scope: e, context: t }) {
					queueMicrotask(() => {
						let n = lO(e);
						if (!n) return;
						hO(n, t.get("acceptedFiles"));
						let r = e.getWin();
						n.dispatchEvent(new r.Event("change", { bubbles: !0 }));
					});
				},
				openFilePicker({ scope: e }) {
					J(() => {
						lO(e)?.click();
					});
				},
				setFiles(e) {
					let { computed: t, context: n, event: r } = e, { acceptedFiles: i, rejectedFiles: a } = mO(e, r.files);
					n.set("acceptedFiles", t("multiple") ? i : i.length > 0 ? [i[0]] : []), n.set("rejectedFiles", a);
				},
				setEventFiles(e) {
					let { computed: t, context: n, event: r, prop: i } = e, a = n.get("acceptedFiles"), o = n.get("rejectedFiles"), { acceptedFiles: s, rejectedFiles: c } = mO(e, r.files, a, o), l = (e) => {
						if (t("multiple")) {
							n.set("acceptedFiles", (t) => [...t, ...e]), n.set("rejectedFiles", c);
							return;
						}
						if (e.length) {
							n.set("acceptedFiles", [e[0]]), n.set("rejectedFiles", c);
							return;
						}
						c.length && (n.set("acceptedFiles", n.get("acceptedFiles")), n.set("rejectedFiles", c));
					}, u = i("transformFiles");
					u ? (n.set("transforming", !0), u(s).then(l).catch((e) => {
						$f(`[zag-js/file-upload] error transforming files
${e}`);
					}).finally(() => {
						n.set("transforming", !1);
					})) : l(s);
				},
				removeFile({ context: e, event: t }) {
					if (t.itemType === "rejected") {
						let n = e.get("rejectedFiles").filter((e) => !xD(e.file, t.file));
						e.set("rejectedFiles", n);
					} else {
						let n = e.get("acceptedFiles").filter((e) => !xD(e, t.file));
						e.set("acceptedFiles", n);
					}
				},
				clearRejectedFiles({ context: e }) {
					e.set("rejectedFiles", []);
				},
				clearFiles({ context: e }) {
					e.set("acceptedFiles", []), e.set("rejectedFiles", []);
				}
			}
		}
	});
})), wO = t((() => {})), TO = t((() => {
	xO(), CO(), wO();
})), EO, DO, OO = t((() => {
	lc(), EO = ac("menu").parts("arrow", "arrowTip", "content", "contextTrigger", "indicator", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "positioner", "separator", "trigger", "triggerItem"), DO = EO.build();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+menu@1.42.0/node_modules/@zag-js/menu/dist/menu.dom.mjs
function kO(e, t) {
	if (!e) return;
	let n = new (Mc(e)).CustomEvent(ik, { detail: { value: t } });
	e.dispatchEvent(n);
}
function AO(e) {
	let t = PO(e);
	return VO(e) ?? e.getDoc().getElementById(t);
}
function jO(e, t) {
	if (!zc(e)) return !1;
	for (let n in t) {
		let r = t[n], i = AO(r.scope);
		if (i && kc(i, e)) return !0;
		let a = r.refs.get("children");
		if (Object.keys(a).length > 0 && jO(e, a)) return !0;
	}
	return !1;
}
var MO, NO, PO, FO, IO, LO, RO, zO, BO, VO, HO, UO, WO, GO, KO, qO, JO, YO, XO, ZO, QO, $O, ek, tk, nk, rk, ik, ak = t((() => {
	Y(), X(), MO = (e, t) => {
		let n = e.ids?.trigger;
		return n == null ? t ? `menu:${e.id}:trigger:${t}` : `menu:${e.id}:trigger` : af(n) ? n(t) : n;
	}, NO = (e, t) => {
		let n = e.ids?.contextTrigger;
		return n == null ? t ? `menu:${e.id}:ctx-trigger:${t}` : `menu:${e.id}:ctx-trigger` : af(n) ? n(t) : n;
	}, PO = (e) => e.ids?.content ?? `menu:${e.id}:content`, FO = (e) => e.ids?.arrow ?? `menu:${e.id}:arrow`, IO = (e) => e.ids?.positioner ?? `menu:${e.id}:popper`, LO = (e, t) => e.ids?.group?.(t) ?? `menu:${e.id}:group:${t}`, RO = (e, t) => `${e.id}/${t}`, zO = (e) => e?.dataset.value ?? null, BO = (e, t) => e.ids?.groupLabel?.(t) ?? `menu:${e.id}:group-label:${t}`, VO = (e) => e.getById(PO(e)), HO = (e) => e.getById(IO(e)), UO = (e) => e.getById(MO(e)), WO = (e, t) => t ? e.getById(RO(e, t)) : null, GO = (e) => e.getById(NO(e)), KO = (e) => Xu(e.getRootNode(), `[data-scope="menu"][data-part="trigger"][data-ownedby="${e.id}"]`), qO = (e) => Xu(e.getRootNode(), `[data-scope="menu"][data-part="context-trigger"][data-ownedby="${e.id}"]`), JO = (e, t) => t == null ? UO(e) ?? KO(e)[0] : e.getById(MO(e, t)), YO = (e) => {
		let t = `[role^="menuitem"][data-ownedby=${CSS.escape(PO(e))}]:not([data-disabled])`;
		return Xu(VO(e), t);
	}, XO = (e) => Bd(YO(e)), ZO = (e) => Vd(YO(e)), QO = (e, t) => t ? e.id === t || e.dataset.value === t : !1, $O = (e, t) => {
		let n = YO(e);
		return Pd(n, n.findIndex((e) => QO(e, t.value)), { loop: t.loop ?? t.loopFocus });
	}, ek = (e, t) => {
		let n = YO(e);
		return Id(n, n.findIndex((e) => QO(e, t.value)), { loop: t.loop ?? t.loopFocus });
	}, tk = (e, t) => {
		let n = YO(e), r = n.find((e) => QO(e, t.value));
		return wd(n, {
			state: t.typeaheadState,
			key: t.key,
			activeId: r?.id ?? null
		});
	}, nk = (e) => zc(e) && (e.dataset.disabled === "" || e.hasAttribute("disabled")), rk = (e) => !!e?.getAttribute("role")?.startsWith("menuitem") && !!e?.hasAttribute("data-controls"), ik = "menu:select";
})), ok = t((() => {})), sk = t((() => {})), ck = t((() => {})), lk = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+rect-utils@1.42.0/node_modules/@zag-js/rect-utils/dist/rect.mjs
function uk(e) {
	let { x: t, y: n, width: r, height: i } = e, a = t + r / 2, o = n + i / 2;
	return {
		x: t,
		y: n,
		width: r,
		height: i,
		minX: t,
		minY: n,
		maxX: t + r,
		maxY: n + i,
		midX: a,
		midY: o,
		center: fk(a, o)
	};
}
function dk(e) {
	return {
		top: fk(e.minX, e.minY),
		right: fk(e.maxX, e.minY),
		bottom: fk(e.maxX, e.maxY),
		left: fk(e.minX, e.maxY)
	};
}
var fk, pk = t((() => {
	fk = (e, t) => ({
		x: e,
		y: t
	});
})), mk = t((() => {})), hk = t((() => {})), gk = t((() => {})), _k = t((() => {})), vk = t((() => {})), yk = t((() => {})), bk = t((() => {})), xk = t((() => {})), Sk, Ck, wk = t((() => {
	({min: Sk, max: Ck} = Math);
})), Tk = t((() => {})), Ek = t((() => {})), Dk = t((() => {})), Ok = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+rect-utils@1.42.0/node_modules/@zag-js/rect-utils/dist/polygon.mjs
function kk(e, t) {
	let { top: n, right: r, left: i, bottom: a } = dk(uk(e)), [o] = t.split("-");
	return {
		top: [
			i,
			n,
			r,
			a
		],
		right: [
			n,
			r,
			a,
			i
		],
		bottom: [
			n,
			i,
			a,
			r
		],
		left: [
			r,
			n,
			i,
			a
		]
	}[o];
}
function Ak(e, t) {
	let { x: n, y: r } = t, i = !1;
	for (let t = 0, a = e.length - 1; t < e.length; a = t++) {
		let o = e[t].x, s = e[t].y, c = e[a].x, l = e[a].y;
		s > r != l > r && n < (c - o) * (r - s) / (l - s) + o && (i = !i);
	}
	return i;
}
var jk = t((() => {
	pk();
})), Mk, Nk, Pk, Fk = t((() => {
	({sign: Mk, abs: Nk, min: Pk} = Math);
})), Ik = t((() => {})), Lk = t((() => {
	ok(), sk(), ck(), lk(), gk(), _k(), vk(), hk(), yk(), bk(), xk(), Tk(), Ek(), Dk(), mk(), Ok(), jk(), pk(), Fk(), Ik(), wk();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+menu@1.42.0/node_modules/@zag-js/menu/dist/menu.utils.mjs
function Rk(e) {
	let t = e.parent;
	for (; t && t.context.get("isSubmenu");) t = t.refs.get("parent");
	t?.send({ type: "CLOSE" });
}
function zk(e, t) {
	return e ? Ak(e, t) : !1;
}
function Bk(e, t, n) {
	let r = Object.keys(e).length > 0;
	if (!t) return null;
	if (!r) return RO(n, t);
	for (let n in e) {
		let r = e[n], i = MO(r.scope);
		if (i === t) return i;
	}
	return RO(n, t);
}
function Vk(e, t) {
	e && (e.refs.set("pointerRoutingLocked", t), e.context.set("pointerRoutingMode", t ? "locked" : "interactive"));
}
function Hk(e) {
	let t = e.context.get("highlightedValue");
	if (!t) return !1;
	let n = e.refs.get("children");
	for (let e in n) {
		let r = n[e];
		if (r.state.hasTag("open") && MO(r.scope) === t) return !0;
	}
	return !1;
}
function Uk(e, t) {
	e && (e.refs.get("pointerRoutingLocked") || t && Hk(e) || Vk(e, !1));
}
function Wk(e) {
	e && (Hk(e) || Vk(e, !1));
}
var Gk = t((() => {
	Lk(), ak();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+menu@1.42.0/node_modules/@zag-js/menu/dist/menu.connect.mjs
function Kk(e, t) {
	let { context: n, send: r, state: i, computed: a, prop: o, scope: s } = e, c = i.hasTag("open"), l = n.get("isSubmenu"), u = a("isTypingAhead"), d = o("composite"), f = n.get("currentPlacement"), p = f ? Ly(f) : void 0, m = n.get("anchorPoint"), h = n.get("highlightedValue"), g = n.get("triggerValue"), _ = rb({
		...o("positioning"),
		placement: f
	});
	function v(e) {
		return {
			id: RO(s, e.value),
			disabled: !!e.disabled,
			highlighted: h === e.value
		};
	}
	function y(e) {
		let t = e.valueText ?? e.value;
		return {
			...e,
			id: e.value,
			valueText: t
		};
	}
	function b(e) {
		return {
			...v(y(e)),
			checked: !!e.checked
		};
	}
	function x(n) {
		let { closeOnSelect: i, valueText: a, value: o } = n, c = v(n), l = RO(s, o);
		return t.element({
			...DO.item.attrs,
			id: l,
			role: "menuitem",
			"aria-disabled": wc(c.disabled),
			"data-disabled": K(c.disabled),
			"data-ownedby": PO(s),
			"data-highlighted": K(c.highlighted),
			"data-value": o,
			"data-valuetext": a,
			onDragStart(e) {
				e.currentTarget.matches("a[href]") && e.preventDefault();
			},
			onPointerMove(e) {
				if (c.disabled || e.pointerType !== "mouse") return;
				let t = e.currentTarget;
				if (c.highlighted) return;
				let n = Ml(e);
				r({
					type: "ITEM_POINTERMOVE",
					id: l,
					target: t,
					closeOnSelect: i,
					point: n
				});
			},
			onPointerLeave(t) {
				if (c.disabled || t.pointerType !== "mouse" || !e.event.previous()?.type.includes("POINTER")) return;
				let n = t.currentTarget;
				r({
					type: "ITEM_POINTERLEAVE",
					id: l,
					target: n,
					closeOnSelect: i
				});
			},
			onPointerDown(e) {
				if (c.disabled) return;
				let t = e.currentTarget;
				r({
					type: "ITEM_POINTERDOWN",
					target: t,
					id: l,
					closeOnSelect: i
				});
			},
			onClick(e) {
				if (wl(e) || Cl(e) || c.disabled) return;
				let t = e.currentTarget;
				r({
					type: "ITEM_CLICK",
					target: t,
					id: l,
					closeOnSelect: i
				});
			}
		});
	}
	return {
		highlightedValue: h,
		open: c,
		setOpen(e) {
			i.hasTag("open") !== e && r({ type: e ? "OPEN" : "CLOSE" });
		},
		triggerValue: g,
		setTriggerValue(e) {
			r({
				type: "TRIGGER_VALUE.SET",
				value: e
			});
		},
		setHighlightedValue(e) {
			r({
				type: "HIGHLIGHTED.SET",
				value: e
			});
		},
		setParent(e) {
			r({
				type: "PARENT.SET",
				value: e,
				id: e.prop("id")
			});
		},
		setChild(e) {
			r({
				type: "CHILD.SET",
				value: e,
				id: e.prop("id")
			});
		},
		reposition(e = {}) {
			r({
				type: "POSITIONING.SET",
				options: e
			});
		},
		addItemListener(e) {
			let t = s.getById(e.id);
			if (!t) return;
			let n = () => e.onSelect?.();
			return t.addEventListener(ik, n), () => t.removeEventListener(ik, n);
		},
		getContextTriggerProps(e = {}) {
			let { value: n } = e, i = n != null && g === n, a = NO(s, n);
			return t.element({
				...DO.contextTrigger.attrs,
				dir: o("dir"),
				id: a,
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": K(i),
				"data-state": c ? "open" : "closed",
				onPointerDown(e) {
					if (e.pointerType === "mouse") return;
					let t = Ml(e);
					r({
						type: "CONTEXT_MENU_START",
						point: t,
						value: n
					});
				},
				onPointerCancel(e) {
					e.pointerType !== "mouse" && r({ type: "CONTEXT_MENU_CANCEL" });
				},
				onPointerMove(e) {
					e.pointerType !== "mouse" && r({ type: "CONTEXT_MENU_CANCEL" });
				},
				onPointerUp(e) {
					e.pointerType !== "mouse" && r({ type: "CONTEXT_MENU_CANCEL" });
				},
				onContextMenu(e) {
					let t = Ml(e);
					r({
						type: c && n != null && !i ? "TRIGGER_VALUE.SET" : "CONTEXT_MENU",
						point: t,
						value: n
					}), e.preventDefault();
				},
				style: {
					WebkitTouchCallout: "none",
					WebkitUserSelect: "none",
					userSelect: "none"
				}
			});
		},
		getTriggerItemProps(e) {
			let t = e.getTriggerProps();
			return wp(x({ value: t.id }), t);
		},
		getTriggerProps(n = {}) {
			let { value: i } = n, a = i != null && g === i, u = MO(s, i);
			return t.button({
				...l ? DO.triggerItem.attrs : DO.trigger.attrs,
				"data-placement": f,
				"data-side": p,
				type: "button",
				dir: o("dir"),
				id: u,
				...i != null && {
					"data-ownedby": s.id,
					"data-value": i,
					"data-current": K(a)
				},
				"data-uid": o("id"),
				"aria-haspopup": d ? "menu" : "dialog",
				"aria-controls": PO(s),
				"data-controls": PO(s),
				"aria-expanded": i == null ? c : c && a,
				"data-state": c ? "open" : "closed",
				onPointerMove(e) {
					if (e.pointerType !== "mouse" || nk(e.currentTarget) || !l) return;
					let t = Ml(e);
					r({
						type: "TRIGGER_POINTERMOVE",
						target: e.currentTarget,
						point: t
					});
				},
				onPointerLeave(t) {
					if (nk(t.currentTarget) || t.pointerType !== "mouse" || !l) return;
					Vk(e.refs.get("parent"), !0);
					let n = Ml(t);
					r({
						type: "TRIGGER_POINTERLEAVE",
						target: t.currentTarget,
						point: n
					});
				},
				onPointerDown(e) {
					nk(e.currentTarget) || Pl(e) || e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || nk(e.currentTarget) || r({
						type: c && i != null && !a ? "TRIGGER_VALUE.SET" : "TRIGGER_CLICK",
						target: e.currentTarget,
						value: i
					});
				},
				onBlur() {
					r({ type: "TRIGGER_BLUR" });
				},
				onFocus() {
					r({ type: "TRIGGER_FOCUS" });
				},
				onKeyDown(e) {
					if (e.defaultPrevented) return;
					let t = {
						ArrowDown() {
							r({
								type: "ARROW_DOWN",
								value: i
							});
						},
						ArrowUp() {
							r({
								type: "ARROW_UP",
								value: i
							});
						},
						Enter() {
							r({
								type: "ARROW_DOWN",
								src: "enter",
								value: i
							});
						},
						Space() {
							r({
								type: "ARROW_DOWN",
								src: "space",
								value: i
							});
						}
					}[kl(e, {
						orientation: "vertical",
						dir: o("dir")
					})];
					t && (e.preventDefault(), t(e));
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...DO.indicator.attrs,
				dir: o("dir"),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...DO.positioner.attrs,
				dir: o("dir"),
				id: IO(s),
				style: _.floating
			});
		},
		getArrowProps() {
			return t.element({
				id: FO(s),
				...DO.arrow.attrs,
				dir: o("dir"),
				style: _.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...DO.arrowTip.attrs,
				dir: o("dir"),
				style: _.arrowTip
			});
		},
		getContentProps() {
			return t.element({
				...DO.content.attrs,
				id: PO(s),
				"aria-label": o("aria-label"),
				hidden: !c,
				"data-state": c ? "open" : "closed",
				role: d ? "menu" : "dialog",
				tabIndex: 0,
				dir: o("dir"),
				"aria-activedescendant": a("highlightedId") || void 0,
				"aria-labelledby": m ? NO(s, g ?? void 0) : MO(s, g ?? void 0),
				"data-placement": f,
				"data-side": p,
				onPointerEnter(e) {
					e.pointerType === "mouse" && r({ type: "MENU_POINTERENTER" });
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !kc(e.currentTarget, Sl(e))) return;
					let t = Sl(e);
					if (!(t?.closest("[role=menu]") === e.currentTarget || t === e.currentTarget)) return;
					if (e.key === "Tab" && !gu(e)) {
						e.preventDefault();
						return;
					}
					let n = {
						ArrowDown() {
							r({ type: "ARROW_DOWN" });
						},
						ArrowUp() {
							r({ type: "ARROW_UP" });
						},
						ArrowLeft() {
							r({ type: "ARROW_LEFT" });
						},
						ArrowRight() {
							r({ type: "ARROW_RIGHT" });
						},
						Enter() {
							r({ type: "ENTER" });
						},
						Space(e) {
							u ? r({
								type: "TYPEAHEAD",
								key: e.key
							}) : n.Enter?.(e);
						},
						Home() {
							r({ type: "HOME" });
						},
						End() {
							r({ type: "END" });
						}
					}, i = n[kl(e, { dir: o("dir") })];
					if (i) {
						i(e), e.stopPropagation(), e.preventDefault();
						return;
					}
					o("typeahead") && Dl(e) && (Fl(e) || Oc(t) || (r({
						type: "TYPEAHEAD",
						key: e.key
					}), e.preventDefault()));
				}
			});
		},
		getSeparatorProps() {
			return t.element({
				...DO.separator.attrs,
				role: "separator",
				dir: o("dir"),
				"aria-orientation": "horizontal"
			});
		},
		getItemState: v,
		getItemProps: x,
		getOptionItemState: b,
		getOptionItemProps(e) {
			let { type: n, disabled: i, closeOnSelect: a } = e, s = y(e), c = b(e);
			return {
				...x(s),
				...t.element({
					"data-type": n,
					...DO.item.attrs,
					dir: o("dir"),
					"data-value": s.value,
					role: `menuitem${n}`,
					"aria-checked": !!c.checked,
					"data-state": c.checked ? "checked" : "unchecked",
					onClick(e) {
						if (i || wl(e) || Cl(e)) return;
						let t = e.currentTarget;
						r({
							type: "ITEM_CLICK",
							target: t,
							option: s,
							closeOnSelect: a
						});
					}
				})
			};
		},
		getItemIndicatorProps(e) {
			let n = b(bf(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...DO.itemIndicator.attrs,
				dir: o("dir"),
				"data-disabled": K(n.disabled),
				"data-highlighted": K(n.highlighted),
				"data-state": sf(e, "checked") ? r : void 0,
				hidden: sf(e, "checked") ? !n.checked : void 0
			});
		},
		getItemTextProps(e) {
			let n = b(bf(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...DO.itemText.attrs,
				dir: o("dir"),
				"data-disabled": K(n.disabled),
				"data-highlighted": K(n.highlighted),
				"data-state": sf(e, "checked") ? r : void 0
			});
		},
		getItemGroupLabelProps(e) {
			return t.element({
				...DO.itemGroupLabel.attrs,
				id: BO(s, e.htmlFor),
				dir: o("dir")
			});
		},
		getItemGroupProps(e) {
			return t.element({
				id: LO(s, e.id),
				...DO.itemGroup.attrs,
				dir: o("dir"),
				"aria-labelledby": BO(s, e.id),
				role: "group"
			});
		}
	};
}
var qk = t((() => {
	um(), Y(), ob(), X(), OO(), ak(), Gk();
})), Jk, Yk, Xk, Zk, Qk = t((() => {
	um(), lx(), Y(), Rh(), ob(), Lk(), X(), ak(), Gk(), {not: Jk, and: Yk, or: Xk} = tm(), Zk = nm({
		props({ props: e }) {
			return {
				closeOnSelect: !0,
				typeahead: !0,
				composite: !0,
				loopFocus: !1,
				navigate(e) {
					Du(e.node);
				},
				...e,
				positioning: {
					placement: "bottom-start",
					gutter: 8,
					...e.positioning
				}
			};
		},
		initialState({ prop: e }) {
			return e("open") || e("defaultOpen") ? "open" : "idle";
		},
		context({ bindable: e, prop: t, scope: n }) {
			return {
				highlightedValue: e(() => ({
					defaultValue: t("defaultHighlightedValue") || null,
					value: t("highlightedValue"),
					onChange(e) {
						t("onHighlightChange")?.({ highlightedValue: e });
					}
				})),
				lastHighlightedValue: e(() => ({ defaultValue: null })),
				currentPlacement: e(() => ({ defaultValue: void 0 })),
				intentPolygon: e(() => ({ defaultValue: null })),
				anchorPoint: e(() => ({
					defaultValue: null,
					hash(e) {
						return `x: ${e?.x}, y: ${e?.y}`;
					}
				})),
				isSubmenu: e(() => ({ defaultValue: !1 })),
				triggerValue: e(() => ({
					defaultValue: t("defaultTriggerValue") ?? null,
					value: t("triggerValue"),
					onChange(e) {
						let r = t("onTriggerValueChange");
						r && r({
							value: e,
							triggerElement: JO(n, e)
						});
					}
				})),
				pointerRoutingMode: e(() => ({ defaultValue: "interactive" }))
			};
		},
		refs() {
			return {
				parent: null,
				children: {},
				pointerRoutingLocked: !1,
				typeaheadState: { ...wd.defaultOptions },
				positioningOverride: {}
			};
		},
		computed: {
			isRtl: ({ prop: e }) => e("dir") === "rtl",
			isTypingAhead: ({ refs: e }) => e.get("typeaheadState").keysSoFar !== "",
			highlightedId: ({ context: e, scope: t, refs: n }) => Bk(n.get("children"), e.get("highlightedValue"), t)
		},
		watch({ track: e, action: t, context: n, prop: r }) {
			e([() => n.get("isSubmenu")], () => {
				t(["setSubmenuPlacement"]);
			}), e([() => n.hash("anchorPoint")], () => {
				n.get("anchorPoint") && t(["reposition"]);
			}), e([() => r("open")], () => {
				t(["toggleVisibility"]);
			});
		},
		on: {
			"TRIGGER_VALUE.SET": { actions: [
				"setTriggerValue",
				"setAnchorPoint",
				"reposition",
				"focusMenu"
			] },
			"PARENT.SET": { actions: ["setParentMenu"] },
			"CHILD.SET": { actions: ["setChildMenu"] },
			OPEN: [{
				guard: "isOpenControlled",
				actions: ["setTriggerValue", "invokeOnOpen"]
			}, {
				target: "open",
				actions: ["setTriggerValue", "invokeOnOpen"]
			}],
			OPEN_AUTOFOCUS: [{
				guard: "isOpenControlled",
				actions: ["setTriggerValue", "invokeOnOpen"]
			}, {
				target: "open",
				actions: [
					"setTriggerValue",
					"highlightFirstItem",
					"invokeOnOpen"
				]
			}],
			CLOSE: [{
				guard: "isOpenControlled",
				actions: ["invokeOnClose", "releaseParentRoutingLock"]
			}, {
				target: "closed",
				actions: [
					"invokeOnClose",
					"releaseParentRoutingLock",
					"focusTrigger"
				]
			}],
			"HIGHLIGHTED.RESTORE": { actions: ["restoreHighlightedItem"] },
			"HIGHLIGHTED.SET": { actions: ["setHighlightedItem"] },
			"HIGHLIGHTED.SUGGEST": { actions: ["suggestHighlightedItem"] }
		},
		states: {
			idle: {
				tags: ["closed"],
				on: {
					"CONTROLLED.OPEN": { target: "open" },
					"CONTROLLED.CLOSE": { target: "closed" },
					CONTEXT_MENU_START: {
						target: "opening:contextmenu",
						actions: ["setAnchorPoint", "setTriggerValue"]
					},
					CONTEXT_MENU: [{
						guard: "isOpenControlled",
						actions: [
							"setAnchorPoint",
							"setTriggerValue",
							"invokeOnOpen"
						]
					}, {
						target: "open",
						actions: [
							"setAnchorPoint",
							"setTriggerValue",
							"invokeOnOpen"
						]
					}],
					TRIGGER_CLICK: [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen", "setTriggerValue"]
					}, {
						target: "open",
						actions: ["invokeOnOpen", "setTriggerValue"]
					}],
					TRIGGER_FOCUS: {
						guard: Jk("isSubmenu"),
						target: "closed"
					},
					TRIGGER_POINTERMOVE: {
						guard: "isSubmenu",
						target: "opening"
					}
				}
			},
			"opening:contextmenu": {
				tags: ["closed"],
				effects: ["waitForLongPress"],
				on: {
					"CONTROLLED.OPEN": {
						target: "open",
						actions: ["reposition"]
					},
					"CONTROLLED.CLOSE": {
						target: "closed",
						actions: ["focusTrigger"]
					},
					CONTEXT_MENU_CANCEL: [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose", "releaseParentRoutingLock"]
					}, {
						target: "closed",
						actions: [
							"invokeOnClose",
							"releaseParentRoutingLock",
							"focusTrigger"
						]
					}],
					"LONG_PRESS.OPEN": [{
						guard: "isOpenControlled",
						actions: ["setTriggerValue", "invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"setTriggerValue",
							"invokeOnOpen",
							"reposition"
						]
					}]
				}
			},
			opening: {
				tags: ["closed"],
				effects: ["waitForOpenDelay"],
				on: {
					"CONTROLLED.OPEN": { target: "open" },
					"CONTROLLED.CLOSE": {
						target: "closed",
						actions: ["focusTrigger"]
					},
					BLUR: [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose", "releaseParentRoutingLock"]
					}, {
						target: "closed",
						actions: [
							"invokeOnClose",
							"releaseParentRoutingLock",
							"focusTrigger"
						]
					}],
					TRIGGER_POINTERLEAVE: [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose", "releaseParentRoutingLock"]
					}, {
						target: "closed",
						actions: [
							"invokeOnClose",
							"releaseParentRoutingLock",
							"focusTrigger"
						]
					}],
					"DELAY.OPEN": [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen"]
					}, {
						target: "open",
						actions: ["invokeOnOpen"]
					}]
				}
			},
			closing: {
				tags: ["open"],
				effects: [
					"trackPointerMove",
					"trackInteractOutside",
					"waitForCloseDelay"
				],
				on: {
					"CONTROLLED.OPEN": { target: "open" },
					"CONTROLLED.CLOSE": {
						target: "closed",
						actions: ["focusParentMenu", "restoreParentHighlightedItem"]
					},
					MENU_POINTERENTER: {
						target: "open",
						actions: ["clearIntentPolygon"]
					},
					POINTER_MOVED_AWAY_FROM_SUBMENU: [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose", "releaseParentRoutingLock"]
					}, {
						target: "closed",
						actions: ["focusParentMenu", "restoreParentHighlightedItem"]
					}],
					"DELAY.CLOSE": [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose", "releaseParentRoutingLock"]
					}, {
						target: "closed",
						actions: [
							"focusParentMenu",
							"restoreParentHighlightedItem",
							"invokeOnClose",
							"releaseParentRoutingLock"
						]
					}]
				}
			},
			closed: {
				tags: ["closed"],
				entry: [
					"clearHighlightedItem",
					"unlockParentOnClose",
					"clearAnchorPoint"
				],
				on: {
					"CONTROLLED.OPEN": [
						{
							guard: Xk("isOpenAutoFocusEvent", "isArrowDownEvent"),
							target: "open",
							actions: ["highlightFirstItem"]
						},
						{
							guard: "isArrowUpEvent",
							target: "open",
							actions: ["highlightLastItem"]
						},
						{ target: "open" }
					],
					CONTEXT_MENU_START: {
						target: "opening:contextmenu",
						actions: ["setAnchorPoint", "setTriggerValue"]
					},
					CONTEXT_MENU: [{
						guard: "isOpenControlled",
						actions: [
							"setAnchorPoint",
							"setTriggerValue",
							"invokeOnOpen"
						]
					}, {
						target: "open",
						actions: [
							"setAnchorPoint",
							"setTriggerValue",
							"invokeOnOpen"
						]
					}],
					TRIGGER_CLICK: [{
						guard: "isOpenControlled",
						actions: ["invokeOnOpen", "setTriggerValue"]
					}, {
						target: "open",
						actions: ["invokeOnOpen", "setTriggerValue"]
					}],
					TRIGGER_POINTERMOVE: {
						guard: "isTriggerItem",
						target: "opening"
					},
					TRIGGER_BLUR: { target: "idle" },
					ARROW_DOWN: [{
						guard: "isOpenControlled",
						actions: ["setTriggerValue", "invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"setTriggerValue",
							"highlightFirstItem",
							"invokeOnOpen"
						]
					}],
					ARROW_UP: [{
						guard: "isOpenControlled",
						actions: ["setTriggerValue", "invokeOnOpen"]
					}, {
						target: "open",
						actions: [
							"setTriggerValue",
							"highlightLastItem",
							"invokeOnOpen"
						]
					}]
				}
			},
			open: {
				tags: ["open"],
				effects: [
					"trackInteractOutside",
					"trackFocusVisible",
					"trackPositioning",
					"scrollToHighlightedItem"
				],
				entry: ["focusMenu", "unlockParentOnOpen"],
				on: {
					"CONTROLLED.CLOSE": [{
						target: "closed",
						guard: "isArrowLeftEvent",
						actions: ["focusParentMenu"]
					}, {
						target: "closed",
						actions: ["focusTrigger"]
					}],
					TRIGGER_CLICK: [{
						guard: Yk(Jk("isTriggerItem"), "isOpenControlled"),
						actions: ["invokeOnClose", "releaseParentRoutingLock"]
					}, {
						guard: Jk("isTriggerItem"),
						target: "closed",
						actions: [
							"invokeOnClose",
							"releaseParentRoutingLock",
							"focusTrigger"
						]
					}],
					CONTEXT_MENU: { actions: [
						"setAnchorPoint",
						"setTriggerValue",
						"focusMenu"
					] },
					ARROW_UP: { actions: ["highlightPrevItem", "focusMenu"] },
					ARROW_DOWN: { actions: ["highlightNextItem", "focusMenu"] },
					ARROW_LEFT: [{
						guard: Yk("isSubmenu", "isOpenControlled"),
						actions: ["invokeOnClose", "releaseParentRoutingLock"]
					}, {
						guard: "isSubmenu",
						target: "closed",
						actions: [
							"focusParentMenu",
							"invokeOnClose",
							"releaseParentRoutingLock"
						]
					}],
					HOME: { actions: ["highlightFirstItem", "focusMenu"] },
					END: { actions: ["highlightLastItem", "focusMenu"] },
					ARROW_RIGHT: {
						guard: "isTriggerItemHighlighted",
						actions: ["openSubmenu"]
					},
					ENTER: [{
						guard: "isTriggerItemHighlighted",
						actions: ["openSubmenu"]
					}, { actions: ["clickHighlightedItem"] }],
					ITEM_POINTERMOVE: [{
						guard: Jk("isPointerRoutingLocked"),
						actions: [
							"setHighlightedItem",
							"focusMenu",
							"closeSiblingMenus"
						]
					}, { actions: ["setLastHighlightedItem", "closeSiblingMenus"] }],
					ITEM_POINTERLEAVE: {
						guard: Yk(Jk("isPointerRoutingLocked"), Jk("isTriggerItem")),
						actions: ["clearHighlightedItem"]
					},
					ITEM_CLICK: [
						{
							guard: Yk(Jk("isTriggerItemHighlighted"), Jk("isHighlightedItemEditable"), "closeOnSelect", "isOpenControlled"),
							actions: [
								"invokeOnSelect",
								"setOptionState",
								"closeRootMenu",
								"invokeOnClose",
								"releaseParentRoutingLock"
							]
						},
						{
							guard: Yk(Jk("isTriggerItemHighlighted"), Jk("isHighlightedItemEditable"), "closeOnSelect"),
							target: "closed",
							actions: [
								"invokeOnSelect",
								"setOptionState",
								"closeRootMenu",
								"invokeOnClose",
								"releaseParentRoutingLock",
								"focusTrigger"
							]
						},
						{
							guard: Yk(Jk("isTriggerItemHighlighted"), Jk("isHighlightedItemEditable")),
							actions: ["invokeOnSelect", "setOptionState"]
						},
						{ actions: ["setHighlightedItem"] }
					],
					TRIGGER_POINTERMOVE: {
						guard: "isTriggerItem",
						actions: ["setIntentPolygon"]
					},
					TRIGGER_POINTERLEAVE: {
						target: "closing",
						actions: ["setIntentPolygon"]
					},
					ITEM_POINTERDOWN: { actions: ["setHighlightedItem"] },
					TYPEAHEAD: { actions: ["highlightMatchedItem"] },
					FOCUS_MENU: { actions: ["focusMenu"] },
					"POSITIONING.SET": { actions: ["reposition"] }
				}
			}
		},
		implementations: {
			guards: {
				closeOnSelect: ({ prop: e, event: t }) => !!(t?.closeOnSelect ?? e("closeOnSelect")),
				isTriggerItem: ({ event: e }) => rk(e.target),
				isTriggerItemHighlighted: ({ event: e, scope: t, computed: n }) => !!(e.target ?? t.getById(n("highlightedId")))?.hasAttribute("data-controls"),
				isSubmenu: ({ context: e }) => e.get("isSubmenu"),
				isPointerRoutingLocked: ({ refs: e }) => e.get("pointerRoutingLocked"),
				isHighlightedItemEditable: ({ scope: e, computed: t }) => Oc(e.getById(t("highlightedId"))),
				isOpenControlled: ({ prop: e }) => e("open") !== void 0,
				isArrowLeftEvent: ({ event: e }) => e.previousEvent?.type === "ARROW_LEFT",
				isArrowUpEvent: ({ event: e }) => e.previousEvent?.type === "ARROW_UP",
				isArrowDownEvent: ({ event: e }) => e.previousEvent?.type === "ARROW_DOWN",
				isOpenAutoFocusEvent: ({ event: e }) => e.previousEvent?.type === "OPEN_AUTOFOCUS"
			},
			effects: {
				waitForOpenDelay({ send: e }) {
					let t = setTimeout(() => {
						e({ type: "DELAY.OPEN" });
					}, 200);
					return () => clearTimeout(t);
				},
				waitForCloseDelay({ send: e }) {
					let t = setTimeout(() => {
						e({ type: "DELAY.CLOSE" });
					}, 100);
					return () => clearTimeout(t);
				},
				waitForLongPress({ send: e }) {
					let t = setTimeout(() => {
						e({ type: "LONG_PRESS.OPEN" });
					}, 700);
					return () => clearTimeout(t);
				},
				trackFocusVisible({ scope: e }) {
					return kh({ root: e.getRootNode?.() });
				},
				trackPositioning({ context: e, prop: t, scope: n, refs: r }) {
					if (GO(n) || qO(n).length > 0) return;
					let i = {
						...t("positioning"),
						...r.get("positioningOverride")
					};
					return e.set("currentPlacement", i.placement), Qy(() => JO(n, e.get("triggerValue")), () => HO(n), {
						...i,
						defer: !0,
						onComplete(t) {
							e.set("currentPlacement", t.placement);
						}
					});
				},
				trackInteractOutside({ refs: e, scope: t, prop: n, context: r, send: i }) {
					let a = () => VO(t), o = !0, s = (e) => qO(t).some((t) => kc(t, e));
					return sx(a, {
						type: "menu",
						defer: !0,
						exclude: [UO(t), ...KO(t)].filter(Boolean),
						onInteractOutside: n("onInteractOutside"),
						onRequestDismiss: n("onRequestDismiss"),
						onFocusOutside(t) {
							n("onFocusOutside")?.(t);
							let r = Sl(t.detail.originalEvent);
							if (s(r)) {
								t.preventDefault();
								return;
							}
							if (jO(r, e.get("children"))) {
								t.preventDefault();
								return;
							}
						},
						onEscapeKeyDown(t) {
							n("onEscapeKeyDown")?.(t), r.get("isSubmenu") && t.preventDefault(), Rk({ parent: e.get("parent") });
						},
						onPointerDownOutside(e) {
							n("onPointerDownOutside")?.(e);
							let t = Sl(e.detail.originalEvent);
							if (s(t) && e.detail.contextmenu) {
								e.preventDefault();
								return;
							}
							o = !e.detail.focusable;
						},
						onDismiss() {
							i({
								type: "CLOSE",
								src: "interact-outside",
								restoreFocus: o
							});
						}
					});
				},
				trackPointerMove({ context: e, scope: t, send: n, refs: r }) {
					let i = r.get("parent");
					if (i) return Vk(i, !0), q(t.getDoc(), "pointermove", (t) => {
						zk(e.get("intentPolygon"), {
							x: t.clientX,
							y: t.clientY
						}) || (n({ type: "POINTER_MOVED_AWAY_FROM_SUBMENU" }), Vk(i, !1));
					});
				},
				scrollToHighlightedItem({ scope: e, computed: t }) {
					let n = () => {
						Eh() !== "pointer" && dd(e.getById(t("highlightedId")), {
							rootEl: VO(e),
							block: "nearest"
						});
					};
					return J(() => {
						Dh("virtual"), n();
					}), Cu(() => VO(e), {
						defer: !0,
						attributes: ["aria-activedescendant"],
						callback: n
					});
				}
			},
			actions: {
				setAnchorPoint({ context: e, event: t }) {
					e.set("anchorPoint", (e) => Zd(e, t.point) ? e : t.point);
				},
				setSubmenuPlacement({ context: e, computed: t, refs: n }) {
					if (!e.get("isSubmenu")) return;
					let r = t("isRtl") ? "left-start" : "right-start";
					n.set("positioningOverride", {
						placement: r,
						gutter: 0
					});
				},
				reposition({ context: e, scope: t, prop: n, event: r, refs: i }) {
					let a = () => HO(t), o = r.point ?? e.get("anchorPoint"), s = o ? () => ({
						width: 0,
						height: 0,
						...o
					}) : void 0, c = {
						...n("positioning"),
						...i.get("positioningOverride")
					}, l = r.value ?? e.get("triggerValue");
					Qy(() => JO(t, l), a, {
						...c,
						defer: !0,
						getAnchorRect: s,
						...r.options ?? {},
						listeners: !1,
						onComplete(t) {
							e.set("currentPlacement", t.placement);
						}
					});
				},
				setOptionState({ event: e }) {
					if (!e.option) return;
					let { checked: t, onCheckedChange: n, type: r } = e.option;
					r === "radio" ? n?.(!0) : r === "checkbox" && n?.(!t);
				},
				clickHighlightedItem({ scope: e, computed: t, prop: n, context: r }) {
					let i = e.getById(t("highlightedId"));
					if (!i || i.dataset.disabled) return;
					let a = r.get("highlightedValue");
					Kc(i) ? n("navigate")?.({
						value: a,
						node: i,
						href: i.href
					}) : queueMicrotask(() => i.click());
				},
				setIntentPolygon({ context: e, scope: t, event: n }) {
					let r = VO(t), i = e.get("currentPlacement");
					if (!r || !i) return;
					let a = kk(r.getBoundingClientRect(), i);
					if (!a) return;
					let o = Ly(i) === "right" ? -5 : 5;
					e.set("intentPolygon", [{
						...n.point,
						x: n.point.x + o
					}, ...a]);
				},
				clearIntentPolygon({ context: e }) {
					e.set("intentPolygon", null);
				},
				clearAnchorPoint({ context: e }) {
					e.set("anchorPoint", null);
				},
				unlockParentOnOpen({ refs: e, context: t, scope: n }) {
					let r = e.get("parent");
					if (t.get("isSubmenu")) {
						let e = MO(n);
						r?.send({
							type: "HIGHLIGHTED.SUGGEST",
							value: e
						});
					}
					Vk(r, !1);
				},
				unlockParentOnClose({ refs: e, context: t }) {
					Uk(e.get("parent"), t.get("isSubmenu"));
				},
				setHighlightedItem({ context: e, event: t }) {
					let n = t.value || zO(t.target);
					e.set("highlightedValue", n);
				},
				clearHighlightedItem({ context: e }) {
					e.set("highlightedValue", null);
				},
				focusMenu({ scope: e }) {
					J(() => {
						let t = VO(e);
						hu({
							root: t,
							enabled: !kc(t, e.getActiveElement()),
							filter(e) {
								return !e.role?.startsWith("menuitem");
							}
						})?.focus({ preventScroll: !0 });
					});
				},
				highlightFirstItem({ context: e, scope: t }) {
					(VO(t) ? queueMicrotask : J)(() => {
						let n = XO(t);
						n && e.set("highlightedValue", zO(n));
					});
				},
				highlightLastItem({ context: e, scope: t }) {
					(VO(t) ? queueMicrotask : J)(() => {
						let n = ZO(t);
						n && e.set("highlightedValue", zO(n));
					});
				},
				highlightNextItem({ context: e, scope: t, event: n, prop: r }) {
					let i = $O(t, {
						loop: n.loop,
						value: e.get("highlightedValue"),
						loopFocus: r("loopFocus")
					});
					e.set("highlightedValue", zO(i));
				},
				highlightPrevItem({ context: e, scope: t, event: n, prop: r }) {
					let i = ek(t, {
						loop: n.loop,
						value: e.get("highlightedValue"),
						loopFocus: r("loopFocus")
					});
					e.set("highlightedValue", zO(i));
				},
				invokeOnSelect({ context: e, prop: t, scope: n }) {
					let r = e.get("highlightedValue");
					r != null && (kO(WO(n, r), r), t("onSelect")?.({ value: r }));
				},
				focusTrigger({ scope: e, context: t, event: n }) {
					t.get("isSubmenu") || t.get("anchorPoint") || n.restoreFocus === !1 || queueMicrotask(() => {
						JO(e, t.get("triggerValue"))?.focus({ preventScroll: !0 });
					});
				},
				highlightMatchedItem({ scope: e, context: t, event: n, refs: r }) {
					let i = tk(e, {
						key: n.key,
						value: t.get("highlightedValue"),
						typeaheadState: r.get("typeaheadState")
					});
					i && t.set("highlightedValue", zO(i));
				},
				setParentMenu({ refs: e, event: t, context: n }) {
					e.set("parent", t.value), n.set("isSubmenu", !0);
				},
				setChildMenu({ refs: e, event: t }) {
					let n = e.get("children");
					n[t.id] = t.value, e.set("children", n);
				},
				closeSiblingMenus({ refs: e, event: t, scope: n }) {
					let r = t.target;
					if (!rk(r)) return;
					let i = r?.getAttribute("data-uid"), a = e.get("children");
					for (let e in a) {
						if (e === i) continue;
						let r = a[e], o = r.context.get("intentPolygon");
						o && t.point && Ak(o, t.point) || (VO(n)?.focus({ preventScroll: !0 }), r.send({ type: "CLOSE" }));
					}
				},
				closeRootMenu({ refs: e }) {
					Rk({ parent: e.get("parent") });
				},
				openSubmenu({ refs: e, scope: t, computed: n }) {
					let r = t.getById(n("highlightedId"))?.getAttribute("data-uid"), i = e.get("children");
					(r ? i[r] : null)?.send({ type: "OPEN_AUTOFOCUS" });
				},
				focusParentMenu({ refs: e }) {
					e.get("parent")?.send({ type: "FOCUS_MENU" });
				},
				setLastHighlightedItem({ context: e, event: t }) {
					e.set("lastHighlightedValue", zO(t.target));
				},
				suggestHighlightedItem({ context: e, event: t }) {
					let n = t.value;
					if (n) {
						if (e.get("highlightedValue") != null) {
							e.set("lastHighlightedValue", n);
							return;
						}
						e.set("highlightedValue", n);
					}
				},
				restoreHighlightedItem({ context: e }) {
					let t = e.get("lastHighlightedValue");
					e.set("lastHighlightedValue", null), t && e.set("highlightedValue", t);
				},
				restoreParentHighlightedItem({ refs: e }) {
					e.get("parent")?.send({ type: "HIGHLIGHTED.RESTORE" });
				},
				invokeOnOpen({ prop: e }) {
					e("onOpenChange")?.({ open: !0 });
				},
				invokeOnClose({ prop: e }) {
					e("onOpenChange")?.({ open: !1 });
				},
				releaseParentRoutingLock({ refs: e, context: t }) {
					t.get("isSubmenu") && Wk(e.get("parent"));
				},
				toggleVisibility({ prop: e, event: t, send: n }) {
					n({
						type: e("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
						previousEvent: t
					});
				},
				setTriggerValue({ context: e, event: t }) {
					t.value !== void 0 && e.set("triggerValue", t.value);
				}
			}
		}
	});
})), $k = t((() => {})), eA = t((() => {
	qk(), Qk(), $k();
})), tA, nA, rA = t((() => {
	lc(), tA = ac("numberInput").parts("root", "label", "input", "control", "valueText", "incrementTrigger", "decrementTrigger", "scrubber"), nA = tA.build();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+number-input@1.42.0/node_modules/@zag-js/number-input/dist/cursor.mjs
function iA(e, t) {
	if (!(!e || !t.isActiveElement(e))) try {
		let { selectionStart: t, selectionEnd: n, value: r } = e;
		return t == null || n == null ? void 0 : {
			start: t,
			end: n,
			value: r
		};
	} catch {
		return;
	}
}
function aA(e, t, n) {
	if (!(!e || !n.isActiveElement(e))) {
		if (!t) {
			let t = e.value.length;
			e.setSelectionRange(t, t);
			return;
		}
		try {
			let n = e.value, { start: r, end: i, value: a } = t;
			if (n === a) {
				e.setSelectionRange(r, i);
				return;
			}
			let o = oA(a, n, r), s = r === i ? o : oA(a, n, i), c = Math.max(0, Math.min(o, n.length)), l = Math.max(c, Math.min(s, n.length));
			e.setSelectionRange(c, l);
		} catch {
			let t = e.value.length;
			e.setSelectionRange(t, t);
		}
	}
}
function oA(e, t, n) {
	let r = e.slice(0, n), i = e.slice(n), a = 0, o = Math.min(r.length, t.length);
	for (let e = 0; e < o && r[e] === t[e]; e++) a = e + 1;
	let s = 0, c = Math.min(i.length, t.length - a);
	for (let e = 0; e < c; e++) {
		let n = i.length - 1 - e, r = t.length - 1 - e;
		if (i[n] === t[r]) s = e + 1;
		else break;
	}
	if (r.length > 0 && a >= r.length) return a;
	if (s >= i.length) return t.length - s;
	if (a > 0) return a;
	if (s > 0) return t.length - s;
	if (n === 0 && a === 0 && s === 0) return t.length;
	if (e.length > 0) {
		let r = n / e.length;
		return Math.round(r * t.length);
	}
	return t.length;
}
var sA = t((() => {})), cA, lA, uA, dA, fA, pA, mA, hA, gA, _A, vA, yA, bA, xA, SA, CA, wA = t((() => {
	Y(), X(), cA = (e) => e.ids?.root ?? `number-input:${e.id}`, lA = (e) => e.ids?.input ?? `number-input:${e.id}:input`, uA = (e) => e.ids?.incrementTrigger ?? `number-input:${e.id}:inc`, dA = (e) => e.ids?.decrementTrigger ?? `number-input:${e.id}:dec`, fA = (e) => e.ids?.scrubber ?? `number-input:${e.id}:scrubber`, pA = (e) => `number-input:${e.id}:cursor`, mA = (e) => e.ids?.label ?? `number-input:${e.id}:label`, hA = (e) => e.getById(lA(e)), gA = (e) => e.getById(uA(e)), _A = (e) => e.getById(dA(e)), vA = (e) => e.getDoc().getElementById(pA(e)), yA = (e, t) => {
		let n = null;
		return t === "increment" && (n = gA(e)), t === "decrement" && (n = _A(e)), n;
	}, bA = (e, t) => {
		if (!_l()) return CA(e, t), () => {
			vA(e)?.remove();
		};
	}, xA = (e) => {
		let t = e.getDoc(), n = t.documentElement, r = t.body;
		return r.style.pointerEvents = "none", n.style.userSelect = "none", n.style.cursor = "ew-resize", () => {
			r.style.pointerEvents = "", n.style.userSelect = "", n.style.cursor = "", n.style.length || n.removeAttribute("style"), r.style.length || r.removeAttribute("style");
		};
	}, SA = (e, t) => {
		let { point: n, isRtl: r, event: i } = t, a = e.getWin(), o = Vf(i.movementX, a.devicePixelRatio), s = Vf(i.movementY, a.devicePixelRatio), c = o > 0 ? "increment" : o < 0 ? "decrement" : null;
		r && c === "increment" && (c = "decrement"), r && c === "decrement" && (c = "increment");
		let l = {
			x: n.x + o,
			y: n.y + s
		}, u = a.innerWidth, d = Vf(7.5, a.devicePixelRatio);
		return l.x = If(l.x + d, u) - d, {
			hint: c,
			point: l
		};
	}, CA = (e, t) => {
		let n = e.getDoc(), r = n.createElement("div");
		r.className = "scrubber--cursor", r.id = pA(e), Object.assign(r.style, {
			width: "15px",
			height: "15px",
			position: "fixed",
			pointerEvents: "none",
			left: "0px",
			top: "0px",
			zIndex: Cc,
			transform: t ? `translate3d(${t.x}px, ${t.y}px, 0px)` : void 0,
			willChange: "transform"
		}), r.innerHTML = "\n      <svg width=\"46\" height=\"15\" style=\"left: -15.5px; position: absolute; top: 0; filter: drop-shadow(rgba(0, 0, 0, 0.4) 0px 1px 1.1px);\">\n        <g transform=\"translate(2 3)\">\n          <path fill-rule=\"evenodd\" d=\"M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z\" style=\"stroke-width: 2px; stroke: white;\"></path>\n          <path fill-rule=\"evenodd\" d=\"M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z\"></path>\n        </g>\n      </svg>", n.body.appendChild(r);
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+number-input@1.42.0/node_modules/@zag-js/number-input/dist/number-input.connect.mjs
function TA(e, t) {
	let { state: n, send: r, prop: i, scope: a, computed: o } = e, s = n.hasTag("focus"), c = o("isDisabled"), l = !!i("readOnly"), u = !!i("required"), d = n.matches("scrubbing"), f = o("isValueEmpty"), p = i("invalid") === void 0 ? o("isOutOfRange") : !!i("invalid"), m = c || !o("canIncrement") || l, h = c || !o("canDecrement") || l, g = i("translations");
	return {
		focused: s,
		invalid: p,
		empty: f,
		value: o("formattedValue"),
		valueAsNumber: o("valueAsNumber"),
		setValue(e) {
			r({
				type: "VALUE.SET",
				value: e
			});
		},
		clearValue() {
			r({ type: "VALUE.CLEAR" });
		},
		increment() {
			r({ type: "VALUE.INCREMENT" });
		},
		decrement() {
			r({ type: "VALUE.DECREMENT" });
		},
		setToMax() {
			r({
				type: "VALUE.SET",
				value: i("max")
			});
		},
		setToMin() {
			r({
				type: "VALUE.SET",
				value: i("min")
			});
		},
		focus() {
			hA(a)?.focus();
		},
		getRootProps() {
			return t.element({
				id: cA(a),
				...nA.root.attrs,
				dir: i("dir"),
				"data-disabled": K(c),
				"data-focus": K(s),
				"data-invalid": K(p),
				"data-scrubbing": K(d)
			});
		},
		getLabelProps() {
			return t.label({
				...nA.label.attrs,
				dir: i("dir"),
				"data-disabled": K(c),
				"data-focus": K(s),
				"data-invalid": K(p),
				"data-required": K(u),
				"data-scrubbing": K(d),
				id: mA(a),
				htmlFor: lA(a),
				onClick() {
					J(() => {
						_c(hA(a));
					});
				}
			});
		},
		getControlProps() {
			return t.element({
				...nA.control.attrs,
				dir: i("dir"),
				role: "group",
				"aria-disabled": c,
				"data-focus": K(s),
				"data-disabled": K(c),
				"data-invalid": K(p),
				"data-scrubbing": K(d),
				"aria-invalid": wc(p)
			});
		},
		getValueTextProps() {
			return t.element({
				...nA.valueText.attrs,
				dir: i("dir"),
				"data-disabled": K(c),
				"data-invalid": K(p),
				"data-focus": K(s),
				"data-scrubbing": K(d)
			});
		},
		getInputProps() {
			return t.input({
				...nA.input.attrs,
				dir: i("dir"),
				name: i("name"),
				form: i("form"),
				id: lA(a),
				role: "spinbutton",
				defaultValue: o("formattedValue"),
				pattern: i("formatOptions") ? void 0 : i("pattern"),
				inputMode: i("inputMode"),
				"aria-invalid": wc(p),
				"data-invalid": K(p),
				disabled: c,
				"data-disabled": K(c),
				readOnly: l,
				required: i("required"),
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: "false",
				type: "text",
				"aria-roledescription": "numberfield",
				"aria-valuemin": i("min"),
				"aria-valuemax": i("max"),
				"aria-valuenow": Number.isNaN(o("valueAsNumber")) ? void 0 : o("valueAsNumber"),
				"aria-valuetext": o("valueText"),
				"data-scrubbing": K(d),
				onFocus() {
					r({ type: "INPUT.FOCUS" });
				},
				onBlur() {
					r({ type: "INPUT.BLUR" });
				},
				onInput(e) {
					let t = iA(e.currentTarget, a);
					r({
						type: "INPUT.CHANGE",
						target: e.currentTarget,
						hint: "set",
						selection: t
					});
				},
				onBeforeInput(e) {
					try {
						let { selectionStart: t, selectionEnd: n, value: r } = e.currentTarget, i = r.slice(0, t) + (e.data ?? "") + r.slice(n);
						o("parser").isValidPartialNumber(i) || e.preventDefault();
					} catch {}
				},
				onKeyDown(e) {
					if (e.defaultPrevented || l || Tl(e)) return;
					let t = jl(e, {
						step: i("step"),
						largeStep: i("largeStep"),
						smallStep: i("smallStep")
					}), n = {
						ArrowUp() {
							r({
								type: "INPUT.ARROW_UP",
								step: t
							}), e.preventDefault();
						},
						ArrowDown() {
							r({
								type: "INPUT.ARROW_DOWN",
								step: t
							}), e.preventDefault();
						},
						Home() {
							Fl(e) || (r({ type: "INPUT.HOME" }), e.preventDefault());
						},
						End() {
							Fl(e) || (r({ type: "INPUT.END" }), e.preventDefault());
						},
						Enter(e) {
							let t = iA(e.currentTarget, a);
							r({
								type: "INPUT.ENTER",
								selection: t
							});
						}
					}[e.key];
					n?.(e);
				}
			});
		},
		getDecrementTriggerProps() {
			return t.button({
				...nA.decrementTrigger.attrs,
				dir: i("dir"),
				id: dA(a),
				disabled: h,
				"data-disabled": K(h),
				"aria-label": g.decrementLabel,
				type: "button",
				tabIndex: -1,
				"aria-controls": lA(a),
				"data-scrubbing": K(d),
				onPointerDown(e) {
					h || Nl(e) && (r({
						type: "TRIGGER.PRESS_DOWN",
						hint: "decrement",
						pointerType: e.pointerType
					}), e.pointerType === "mouse" && e.preventDefault(), e.pointerType === "touch" && e.currentTarget?.focus({ preventScroll: !0 }));
				},
				onPointerUp(e) {
					r({
						type: "TRIGGER.PRESS_UP",
						hint: "decrement",
						pointerType: e.pointerType
					});
				},
				onPointerLeave() {
					h || r({
						type: "TRIGGER.PRESS_UP",
						hint: "decrement"
					});
				}
			});
		},
		getIncrementTriggerProps() {
			return t.button({
				...nA.incrementTrigger.attrs,
				dir: i("dir"),
				id: uA(a),
				disabled: m,
				"data-disabled": K(m),
				"aria-label": g.incrementLabel,
				type: "button",
				tabIndex: -1,
				"aria-controls": lA(a),
				"data-scrubbing": K(d),
				onPointerDown(e) {
					m || !Nl(e) || (r({
						type: "TRIGGER.PRESS_DOWN",
						hint: "increment",
						pointerType: e.pointerType
					}), e.pointerType === "mouse" && e.preventDefault(), e.pointerType === "touch" && e.currentTarget?.focus({ preventScroll: !0 }));
				},
				onPointerUp(e) {
					r({
						type: "TRIGGER.PRESS_UP",
						hint: "increment",
						pointerType: e.pointerType
					});
				},
				onPointerLeave(e) {
					r({
						type: "TRIGGER.PRESS_UP",
						hint: "increment",
						pointerType: e.pointerType
					});
				}
			});
		},
		getScrubberProps() {
			return t.element({
				...nA.scrubber.attrs,
				dir: i("dir"),
				"data-disabled": K(c),
				id: fA(a),
				role: "presentation",
				"data-scrubbing": K(d),
				onMouseDown(e) {
					if (c || !Nl(e)) return;
					let t = Ml(e), n = Mc(e.currentTarget).devicePixelRatio;
					t.x -= Vf(7.5, n), t.y -= Vf(7.5, n), r({
						type: "SCRUBBER.PRESS_DOWN",
						point: t
					}), e.preventDefault(), J(() => {
						_c(hA(a));
					});
				},
				style: { cursor: c ? void 0 : "ew-resize" }
			});
		}
	};
}
var EA = t((() => {
	Y(), X(), sA(), rA(), wA();
}));
//#endregion
//#region node_modules/.pnpm/@internationalized+number@3.6.7/node_modules/@internationalized/number/dist/private/NumberFormatter.mjs
function DA(e, t = {}) {
	let { numberingSystem: n } = t;
	if (n && e.includes("-nu-") && (e.includes("-u-") || (e += "-u-"), e += `-nu-${n}`), t.style === "unit" && !jA) {
		let { unit: e, unitDisplay: n = "short" } = t;
		if (!e) throw Error("unit option must be provided with style: \"unit\"");
		if (!MA[e]?.[n]) throw Error(`Unsupported unit ${e} with unitDisplay = ${n}`);
		t = {
			...t,
			style: "decimal"
		};
	}
	let r = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
	if (kA.has(r)) return kA.get(r);
	let i = new Intl.NumberFormat(e, t);
	return kA.set(r, i), i;
}
function OA(e, t, n) {
	if (t === "auto") return e.format(n);
	if (t === "never") return e.format(Math.abs(n));
	{
		let r = !1;
		if (t === "always" ? r = n > 0 || Object.is(n, 0) : t === "exceptZero" && (Object.is(n, -0) || Object.is(n, 0) ? n = Math.abs(n) : r = n > 0), r) {
			let t = e.format(-n), r = e.format(n), i = t.replace(r, "").replace(/\u200e|\u061C/, "");
			return [...i].length !== 1 && console.warn("@react-aria/i18n polyfill for NumberFormat signDisplay: Unsupported case"), t.replace(r, "!!!").replace(i, "+").replace("!!!", r);
		} else return e.format(n);
	}
}
var kA, AA, jA, MA, NA, PA = t((() => {
	kA = /* @__PURE__ */ new Map(), AA = !1;
	try {
		AA = new Intl.NumberFormat("de-DE", { signDisplay: "exceptZero" }).resolvedOptions().signDisplay === "exceptZero";
	} catch {}
	jA = !1;
	try {
		jA = new Intl.NumberFormat("de-DE", {
			style: "unit",
			unit: "degree"
		}).resolvedOptions().style === "unit";
	} catch {}
	MA = { degree: { narrow: {
		default: "°",
		"ja-JP": " 度",
		"zh-TW": "度",
		"sl-SI": " °"
	} } }, NA = class {
		constructor(e, t = {}) {
			this.numberFormatter = DA(e, t), this.options = t;
		}
		format(e) {
			let t = "";
			if (t = !AA && this.options.signDisplay != null ? OA(this.numberFormatter, this.options.signDisplay, e) : this.numberFormatter.format(e), this.options.style === "unit" && !jA) {
				let { unit: e, unitDisplay: n = "short", locale: r } = this.resolvedOptions();
				if (!e) return t;
				let i = MA[e]?.[n];
				t += i[r] || i.default;
			}
			return t;
		}
		formatToParts(e) {
			return this.numberFormatter.formatToParts(e);
		}
		formatRange(e, t) {
			if (typeof this.numberFormatter.formatRange == "function") return this.numberFormatter.formatRange(e, t);
			if (t < e) throw RangeError("End date must be >= start date");
			return `${this.format(e)} \u{2013} ${this.format(t)}`;
		}
		formatRangeToParts(e, t) {
			if (typeof this.numberFormatter.formatRangeToParts == "function") return this.numberFormatter.formatRangeToParts(e, t);
			if (t < e) throw RangeError("End date must be >= start date");
			let n = this.numberFormatter.formatToParts(e), r = this.numberFormatter.formatToParts(t);
			return [
				...n.map((e) => ({
					...e,
					source: "startRange"
				})),
				{
					type: "literal",
					value: " – ",
					source: "shared"
				},
				...r.map((e) => ({
					...e,
					source: "endRange"
				}))
			];
		}
		resolvedOptions() {
			let e = this.numberFormatter.resolvedOptions();
			return !AA && this.options.signDisplay != null && (e = {
				...e,
				signDisplay: this.options.signDisplay
			}), !jA && this.options.style === "unit" && (e = {
				...e,
				style: "unit",
				unit: this.options.unit,
				unitDisplay: this.options.unitDisplay
			}), e;
		}
	};
}));
//#endregion
//#region node_modules/.pnpm/@internationalized+number@3.6.7/node_modules/@internationalized/number/dist/private/NumberParser.mjs
function FA(e, t, n) {
	let r = IA(e, t);
	if (!e.includes("-nu-") && !r.isValidPartialNumber(n)) {
		for (let i of VA) if (i !== r.options.numberingSystem) {
			let r = IA(e + (e.includes("-u-") ? "-nu-" : "-u-nu-") + i, t);
			if (r.isValidPartialNumber(n)) return r;
		}
	}
	return r;
}
function IA(e, t) {
	let n = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : ""), r = UA.get(n);
	return r || (r = new WA(e, t), UA.set(n, r)), r;
}
function LA(e, t, n, r) {
	let i = new Intl.NumberFormat(e, {
		...n,
		minimumSignificantDigits: 1,
		maximumSignificantDigits: 21,
		roundingIncrement: 1,
		roundingPriority: "auto",
		roundingMode: "halfExpand",
		useGrouping: !0
	}), a = i.formatToParts(-10000.111), o = i.formatToParts(10000.111), s = KA.map((e) => i.formatToParts(e)), c = s.map((e, t) => {
		let n = e.find((e) => e.type === "unit");
		return n && !e.some((e) => e.type === "integer" || e.type === "fraction") ? {
			unit: n.value,
			value: KA[t]
		} : null;
	}).filter((e) => !!e), l = a.find((e) => e.type === "minusSign")?.value ?? "-", u = o.find((e) => e.type === "plusSign")?.value;
	!u && (r?.signDisplay === "exceptZero" || r?.signDisplay === "always") && (u = "+");
	let d = new Intl.NumberFormat(e, {
		...n,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).formatToParts(.001).find((e) => e.type === "decimal")?.value, f = a.find((e) => e.type === "group")?.value, p = a.filter((e) => !GA.has(e.type)).map((e) => zA(e.value)), m = s.flatMap((e) => e.filter((e) => !GA.has(e.type)).map((e) => zA(e.value))), h = [.../* @__PURE__ */ new Set([...p, ...m])].sort((e, t) => t.length - e.length), g = h.length === 0 ? /* @__PURE__ */ RegExp("\\p{White_Space}|\\p{Cf}", "gu") : RegExp(`${h.join("|")}|\\p{White_Space}|\\p{Cf}`, "gu"), _ = [...new Intl.NumberFormat(n.locale, { useGrouping: !1 }).format(9876543210)].reverse(), v = new Map(_.map((e, t) => [e, t])), y = RegExp(`[${_.join("")}]`, "g");
	return {
		minusSign: l,
		plusSign: u,
		decimal: d,
		group: f,
		literals: g,
		numeral: y,
		numerals: _,
		index: (e) => String(v.get(e)),
		noNumeralUnits: c
	};
}
function RA(e, t, n) {
	return e.replaceAll ? e.replaceAll(t, n) : e.split(t).join(n);
}
function zA(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
var BA, VA, HA, UA, WA, GA, KA, qA = t((() => {
	PA(), BA = /* @__PURE__ */ RegExp("^.*\\(.*\\).*$"), VA = [
		"latn",
		"arab",
		"hanidec",
		"deva",
		"beng",
		"fullwide"
	], HA = class {
		constructor(e, t = {}) {
			this.locale = e, this.options = t;
		}
		parse(e) {
			return FA(this.locale, this.options, e).parse(e);
		}
		isValidPartialNumber(e, t, n) {
			return FA(this.locale, this.options, e).isValidPartialNumber(e, t, n);
		}
		getNumberingSystem(e) {
			return FA(this.locale, this.options, e).options.numberingSystem;
		}
	}, UA = /* @__PURE__ */ new Map(), WA = class {
		constructor(e, t = {}) {
			this.locale = e, t.roundingIncrement !== 1 && t.roundingIncrement != null && (t.maximumFractionDigits == null && t.minimumFractionDigits == null ? (t.maximumFractionDigits = 0, t.minimumFractionDigits = 0) : t.maximumFractionDigits == null ? t.maximumFractionDigits = t.minimumFractionDigits : t.minimumFractionDigits ??= t.maximumFractionDigits), this.formatter = new Intl.NumberFormat(e, t), this.options = this.formatter.resolvedOptions(), this.symbols = LA(e, this.formatter, this.options, t), this.options.style === "percent" && ((this.options.minimumFractionDigits ?? 0) > 18 || (this.options.maximumFractionDigits ?? 0) > 18) && console.warn("NumberParser cannot handle percentages with greater than 18 decimal places, please reduce the number in your options.");
		}
		parse(e) {
			let t = this.formatter.resolvedOptions().useGrouping, n = this.sanitize(e);
			if (!t && this.symbols.group && n.includes(this.symbols.group)) return NaN;
			if (this.symbols.group && (n = n.replaceAll(this.symbols.group, "")), this.symbols.decimal && (n = n.replace(this.symbols.decimal, ".")), this.symbols.minusSign && (n = n.replace(this.symbols.minusSign, "-")), n = n.replace(this.symbols.numeral, this.symbols.index), this.options.style === "percent") {
				let e = n.indexOf("-");
				n = n.replace("-", ""), n = n.replace("+", "");
				let t = n.indexOf(".");
				t === -1 && (t = n.length), n = n.replace(".", ""), n = t - 2 == 0 ? `0.${n}` : t - 2 == -1 ? `0.0${n}` : t - 2 == -2 ? "0.00" : `${n.slice(0, t - 2)}.${n.slice(t - 2)}`, e > -1 && (n = `-${n}`);
			}
			let r = n ? +n : NaN;
			if (isNaN(r)) return NaN;
			if (this.options.style === "percent") {
				let e = {
					...this.options,
					style: "decimal",
					minimumFractionDigits: Math.min((this.options.minimumFractionDigits ?? 0) + 2, 20),
					maximumFractionDigits: Math.min((this.options.maximumFractionDigits ?? 0) + 2, 20)
				};
				return new HA(this.locale, e).parse(new NA(this.locale, e).format(r));
			}
			return this.options.currencySign === "accounting" && BA.test(e) && (r = -1 * r), r;
		}
		sanitize(e) {
			let t = this.formatter.resolvedOptions().useGrouping;
			return this.symbols.noNumeralUnits.length > 0 && this.symbols.noNumeralUnits.find((t) => t.unit === e) ? this.symbols.noNumeralUnits.find((t) => t.unit === e).value.toString() : (e = e.replace(this.symbols.literals, ""), this.symbols.minusSign && (e = e.replace("-", this.symbols.minusSign)), this.options.numberingSystem === "arab" && (this.symbols.decimal && (e = RA(e, ",", this.symbols.decimal), e = RA(e, "،", this.symbols.decimal)), this.symbols.group && t && (e = RA(e, ".", this.symbols.group))), this.symbols.group === "’" && e.includes("'") && t && (e = RA(e, "'", this.symbols.group)), this.symbols.group === "'" && e.includes("’") && t && (e = RA(e, "’", this.symbols.group)), this.options.locale === "fr-FR" && this.symbols.group && t && (e = RA(e, " ", this.symbols.group), e = RA(e, /\u00A0/g, this.symbols.group)), e);
		}
		isValidPartialNumber(e, t = -Infinity, n = Infinity) {
			let r = this.formatter.resolvedOptions().useGrouping;
			return e = this.sanitize(e), this.symbols.minusSign && e.startsWith(this.symbols.minusSign) && t < 0 ? e = e.slice(this.symbols.minusSign.length) : this.symbols.plusSign && e.startsWith(this.symbols.plusSign) && n > 0 && (e = e.slice(this.symbols.plusSign.length)), this.symbols.decimal && e.indexOf(this.symbols.decimal) > -1 && this.options.maximumFractionDigits === 0 ? !1 : (this.symbols.group && r && (e = RA(e, this.symbols.group, "")), e = e.replace(this.symbols.numeral, ""), this.symbols.decimal && (e = e.replace(this.symbols.decimal, "")), e.length === 0);
		}
	}, GA = /* @__PURE__ */ new Set([
		"decimal",
		"fraction",
		"integer",
		"minusSign",
		"plusSign",
		"group"
	]), KA = [
		0,
		4,
		2,
		1,
		11,
		20,
		3,
		7,
		100,
		21,
		.1,
		1.1
	];
})), JA = t((() => {
	qA();
})), YA, XA, ZA, QA, $A, ej = t((() => {
	JA(), YA = (e, t = {}) => new Intl.NumberFormat(e, t), XA = (e, t = {}) => new HA(e, t), ZA = (e, t) => {
		let { prop: n, computed: r } = t;
		return n("formatOptions") ? e === "" ? NaN : r("parser").parse(e) : parseFloat(e);
	}, QA = (e, t) => {
		let { prop: n, computed: r } = t;
		return Number.isNaN(e) ? "" : n("formatOptions") ? r("formatter").format(e) : e.toString();
	}, $A = (e, t) => {
		let n = e !== void 0 && !Number.isNaN(e) ? e : 1;
		return t?.style === "percent" && (e === void 0 || Number.isNaN(e)) && (n = .01), n;
	};
})), tj, nj, rj, ij, aj, oj, sj = t((() => {
	um(), Y(), X(), sA(), wA(), ej(), {choose: tj, guards: nj, createMachine: rj} = rm(), {not: ij, and: aj} = nj, oj = rj({
		props({ props: e }) {
			let t = $A(e.step, e.formatOptions);
			return {
				dir: "ltr",
				locale: "en-US",
				focusInputOnChange: !0,
				clampValueOnBlur: !e.allowOverflow,
				allowOverflow: !1,
				inputMode: "decimal",
				pattern: "-?[0-9]*(.[0-9]+)?",
				defaultValue: "",
				step: t,
				min: -(2 ** 53 - 1),
				max: 2 ** 53 - 1,
				spinOnPress: !0,
				...e,
				largeStep: e.largeStep ?? 10 * t,
				smallStep: e.smallStep ?? t / 10,
				translations: {
					incrementLabel: "increment value",
					decrementLabel: "decrease value",
					...e.translations
				}
			};
		},
		initialState() {
			return "idle";
		},
		context({ prop: e, bindable: t, getComputed: n }) {
			return {
				value: t(() => ({
					defaultValue: e("defaultValue"),
					value: e("value"),
					onChange(t) {
						let r = ZA(t, {
							computed: n(),
							prop: e
						});
						e("onValueChange")?.({
							value: t,
							valueAsNumber: r
						});
					}
				})),
				hint: t(() => ({ defaultValue: null })),
				scrubberCursorPoint: t(() => ({
					defaultValue: null,
					hash(e) {
						return e ? `x:${e.x}, y:${e.y}` : "";
					}
				})),
				fieldsetDisabled: t(() => ({ defaultValue: !1 }))
			};
		},
		computed: {
			isRtl: ({ prop: e }) => e("dir") === "rtl",
			valueAsNumber: ({ context: e, computed: t, prop: n }) => ZA(e.get("value"), {
				computed: t,
				prop: n
			}),
			formattedValue: ({ computed: e, prop: t }) => QA(e("valueAsNumber"), {
				computed: e,
				prop: t
			}),
			isAtMin: ({ computed: e, prop: t }) => Rf(e("valueAsNumber"), t("min")),
			isAtMax: ({ computed: e, prop: t }) => Lf(e("valueAsNumber"), t("max")),
			isOutOfRange: ({ computed: e, prop: t }) => !zf(e("valueAsNumber"), t("min"), t("max")),
			isValueEmpty: ({ context: e }) => e.get("value") === "",
			isDisabled: ({ prop: e, context: t }) => !!e("disabled") || t.get("fieldsetDisabled"),
			canIncrement: ({ prop: e, computed: t }) => e("allowOverflow") || !t("isAtMax"),
			canDecrement: ({ prop: e, computed: t }) => e("allowOverflow") || !t("isAtMin"),
			valueText: ({ prop: e, context: t }) => e("translations").valueText?.(t.get("value")),
			formatter: Ap(({ prop: e }) => [e("locale"), e("formatOptions")], ([e, t]) => YA(e, t)),
			parser: Ap(({ prop: e }) => [e("locale"), e("formatOptions")], ([e, t]) => XA(e, t))
		},
		watch({ track: e, action: t, context: n, computed: r, prop: i }) {
			e([
				() => n.get("value"),
				() => i("locale"),
				() => JSON.stringify(i("formatOptions"))
			], () => {
				t(["syncInputElement"]);
			}), e([() => r("isOutOfRange")], () => {
				t(["invokeOnInvalid"]);
			}), e([() => n.hash("scrubberCursorPoint")], () => {
				t(["setVirtualCursorPosition"]);
			});
		},
		effects: ["trackFormControl"],
		on: {
			"VALUE.SET": { actions: ["setRawValue"] },
			"VALUE.CLEAR": { actions: ["clearValue"] },
			"VALUE.INCREMENT": { actions: ["increment"] },
			"VALUE.DECREMENT": { actions: ["decrement"] }
		},
		states: {
			idle: { on: {
				"TRIGGER.PRESS_DOWN": [{
					guard: "isTouchPointer",
					target: "before:spin",
					actions: ["setHint"]
				}, {
					target: "before:spin",
					actions: [
						"focusInput",
						"invokeOnFocus",
						"setHint"
					]
				}],
				"SCRUBBER.PRESS_DOWN": {
					target: "scrubbing",
					actions: [
						"focusInput",
						"invokeOnFocus",
						"setHint",
						"setCursorPoint"
					]
				},
				"INPUT.FOCUS": {
					target: "focused",
					actions: ["focusInput", "invokeOnFocus"]
				}
			} },
			focused: {
				tags: ["focus"],
				effects: ["attachWheelListener"],
				on: {
					"TRIGGER.PRESS_DOWN": [{
						guard: "isTouchPointer",
						target: "before:spin",
						actions: ["setHint"]
					}, {
						target: "before:spin",
						actions: ["focusInput", "setHint"]
					}],
					"SCRUBBER.PRESS_DOWN": {
						target: "scrubbing",
						actions: [
							"focusInput",
							"setHint",
							"setCursorPoint"
						]
					},
					"INPUT.ARROW_UP": { actions: ["increment"] },
					"INPUT.ARROW_DOWN": { actions: ["decrement"] },
					"INPUT.HOME": { actions: ["decrementToMin"] },
					"INPUT.END": { actions: ["incrementToMax"] },
					"INPUT.CHANGE": { actions: ["setValue", "setHint"] },
					"INPUT.BLUR": [
						{
							guard: aj("clampValueOnBlur", ij("isValueEmpty"), ij("isInRange")),
							target: "idle",
							actions: [
								"setClampedValue",
								"clearHint",
								"invokeOnBlur",
								"invokeOnValueCommit"
							]
						},
						{
							guard: ij("isInRange"),
							target: "idle",
							actions: [
								"setFormattedValue",
								"clearHint",
								"invokeOnBlur",
								"invokeOnInvalid",
								"invokeOnValueCommit"
							]
						},
						{
							target: "idle",
							actions: [
								"setFormattedValue",
								"clearHint",
								"invokeOnBlur",
								"invokeOnValueCommit"
							]
						}
					],
					"INPUT.ENTER": { actions: [
						"setFormattedValue",
						"clearHint",
						"invokeOnBlur",
						"invokeOnValueCommit"
					] }
				}
			},
			"before:spin": {
				tags: ["focus"],
				effects: ["trackButtonDisabled", "waitForChangeDelay"],
				entry: tj([{
					guard: "isIncrementHint",
					actions: ["increment"]
				}, {
					guard: "isDecrementHint",
					actions: ["decrement"]
				}]),
				on: {
					CHANGE_DELAY: {
						target: "spinning",
						guard: aj("isInRange", "spinOnPress")
					},
					"TRIGGER.PRESS_UP": [{
						guard: "isTouchPointer",
						target: "focused",
						actions: ["clearHint"]
					}, {
						target: "focused",
						actions: ["focusInput", "clearHint"]
					}]
				}
			},
			spinning: {
				tags: ["focus"],
				effects: ["trackButtonDisabled", "spinValue"],
				on: {
					SPIN: [{
						guard: "isIncrementHint",
						actions: ["increment"]
					}, {
						guard: "isDecrementHint",
						actions: ["decrement"]
					}],
					"TRIGGER.PRESS_UP": {
						target: "focused",
						actions: ["focusInput", "clearHint"]
					}
				}
			},
			scrubbing: {
				tags: ["focus"],
				effects: [
					"activatePointerLock",
					"trackMousemove",
					"setupVirtualCursor",
					"preventTextSelection"
				],
				on: {
					"SCRUBBER.POINTER_UP": {
						target: "focused",
						actions: ["focusInput", "clearCursorPoint"]
					},
					"SCRUBBER.POINTER_MOVE": [{
						guard: "isIncrementHint",
						actions: ["increment", "setCursorPoint"]
					}, {
						guard: "isDecrementHint",
						actions: ["decrement", "setCursorPoint"]
					}]
				}
			}
		},
		implementations: {
			guards: {
				clampValueOnBlur: ({ prop: e }) => e("clampValueOnBlur"),
				spinOnPress: ({ prop: e }) => !!e("spinOnPress"),
				isInRange: ({ computed: e }) => !e("isOutOfRange"),
				isValueEmpty: ({ computed: e }) => e("isValueEmpty"),
				isDecrementHint: ({ context: e, event: t }) => (t.hint ?? e.get("hint")) === "decrement",
				isIncrementHint: ({ context: e, event: t }) => (t.hint ?? e.get("hint")) === "increment",
				isTouchPointer: ({ event: e }) => e.pointerType === "touch"
			},
			effects: {
				waitForChangeDelay({ send: e }) {
					let t = setTimeout(() => {
						e({ type: "CHANGE_DELAY" });
					}, 300);
					return () => clearTimeout(t);
				},
				spinValue({ send: e }) {
					let t = setInterval(() => {
						e({ type: "SPIN" });
					}, 50);
					return () => clearInterval(t);
				},
				trackFormControl({ context: e, scope: t }) {
					return Xl(hA(t), {
						onFieldsetDisabledChange(t) {
							e.set("fieldsetDisabled", t);
						},
						onFormReset() {
							e.set("value", e.initial("value"));
						}
					});
				},
				setupVirtualCursor({ context: e, scope: t }) {
					let n = e.get("scrubberCursorPoint");
					return bA(t, n);
				},
				preventTextSelection({ scope: e }) {
					return xA(e);
				},
				trackButtonDisabled({ context: e, scope: t, send: n }) {
					let r = e.get("hint");
					return Cu(yA(t, r), {
						attributes: ["disabled"],
						callback() {
							n({
								type: "TRIGGER.PRESS_UP",
								src: "attr"
							});
						}
					});
				},
				attachWheelListener({ scope: e, send: t, prop: n }) {
					let r = hA(e);
					if (!r || !e.isActiveElement(r) || !n("allowMouseWheel")) return;
					function i(e) {
						e.preventDefault();
						let n = Math.sign(e.deltaY) * -1;
						n === 1 ? t({ type: "VALUE.INCREMENT" }) : n === -1 && t({ type: "VALUE.DECREMENT" });
					}
					return q(r, "wheel", i, { passive: !1 });
				},
				activatePointerLock({ scope: e }) {
					if (!_l()) return Iu(e.getDoc());
				},
				trackMousemove({ scope: e, send: t, context: n, computed: r }) {
					let i = e.getDoc();
					function a(i) {
						let a = n.get("scrubberCursorPoint"), o = r("isRtl"), s = SA(e, {
							point: a,
							isRtl: o,
							event: i
						});
						s.hint && t({
							type: "SCRUBBER.POINTER_MOVE",
							hint: s.hint,
							point: s.point
						});
					}
					function o() {
						t({ type: "SCRUBBER.POINTER_UP" });
					}
					return Cf(q(i, "mousemove", a, !1), q(i, "mouseup", o, !1));
				}
			},
			actions: {
				focusInput({ scope: e, prop: t }) {
					if (!t("focusInputOnChange")) return;
					let n = hA(e);
					e.isActiveElement(n) || J(() => n?.focus({ preventScroll: !0 }));
				},
				increment({ context: e, event: t, prop: n, computed: r }) {
					let i = Wf(r("valueAsNumber"), t.step ?? n("step"));
					n("allowOverflow") || (i = Bf(i, n("min"), n("max"))), e.set("value", QA(i, {
						computed: r,
						prop: n
					}));
				},
				decrement({ context: e, event: t, prop: n, computed: r }) {
					let i = Gf(r("valueAsNumber"), t.step ?? n("step"));
					n("allowOverflow") || (i = Bf(i, n("min"), n("max"))), e.set("value", QA(i, {
						computed: r,
						prop: n
					}));
				},
				setClampedValue({ context: e, prop: t, computed: n }) {
					let r = Bf(n("valueAsNumber"), t("min"), t("max"));
					e.set("value", QA(r, {
						computed: n,
						prop: t
					}));
				},
				setRawValue({ context: e, event: t, prop: n, computed: r }) {
					let i = typeof t.value == "number" ? t.value : ZA(t.value, {
						computed: r,
						prop: n
					});
					n("allowOverflow") || (i = Bf(i, n("min"), n("max"))), e.set("value", QA(i, {
						computed: r,
						prop: n
					}));
				},
				setValue({ context: e, event: t }) {
					let n = t.target?.value ?? t.value;
					e.set("value", n);
				},
				clearValue({ context: e }) {
					e.set("value", "");
				},
				incrementToMax({ context: e, prop: t, computed: n }) {
					let r = QA(t("max"), {
						computed: n,
						prop: t
					});
					e.set("value", r);
				},
				decrementToMin({ context: e, prop: t, computed: n }) {
					let r = QA(t("min"), {
						computed: n,
						prop: t
					});
					e.set("value", r);
				},
				setHint({ context: e, event: t }) {
					e.set("hint", t.hint);
				},
				clearHint({ context: e }) {
					e.set("hint", null);
				},
				invokeOnFocus({ computed: e, prop: t }) {
					t("onFocusChange")?.({
						focused: !0,
						value: e("formattedValue"),
						valueAsNumber: e("valueAsNumber")
					});
				},
				invokeOnBlur({ computed: e, prop: t }) {
					t("onFocusChange")?.({
						focused: !1,
						value: e("formattedValue"),
						valueAsNumber: e("valueAsNumber")
					});
				},
				invokeOnInvalid({ computed: e, prop: t, event: n }) {
					if (n.type === "INPUT.CHANGE") return;
					let r = e("valueAsNumber") > t("max") ? "rangeOverflow" : "rangeUnderflow";
					t("onValueInvalid")?.({
						reason: r,
						value: e("formattedValue"),
						valueAsNumber: e("valueAsNumber")
					});
				},
				invokeOnValueCommit({ computed: e, prop: t }) {
					t("onValueCommit")?.({
						value: e("formattedValue"),
						valueAsNumber: e("valueAsNumber")
					});
				},
				syncInputElement({ context: e, event: t, computed: n, scope: r }) {
					let i = t.type.endsWith("CHANGE") ? e.get("value") : n("formattedValue"), a = hA(r), o = t.selection ?? iA(a, r);
					J(() => {
						Wl(a, i), aA(a, o, r);
					});
				},
				setFormattedValue({ context: e, computed: t, action: n }) {
					e.set("value", t("formattedValue")), n(["syncInputElement"]);
				},
				setCursorPoint({ context: e, event: t }) {
					e.set("scrubberCursorPoint", t.point);
				},
				clearCursorPoint({ context: e }) {
					e.set("scrubberCursorPoint", null);
				},
				setVirtualCursorPosition({ context: e, scope: t }) {
					let n = vA(t), r = e.get("scrubberCursorPoint");
					!n || !r || (n.style.transform = `translate3d(${r.x}px, ${r.y}px, 0px)`);
				}
			}
		}
	});
})), cj = t((() => {})), lj = t((() => {
	EA(), sj(), cj();
})), uj, dj, fj = t((() => {
	lc(), uj = ac("tree-view").parts("branch", "branchContent", "branchControl", "branchIndentGuide", "branchIndicator", "branchText", "branchTrigger", "item", "itemIndicator", "itemText", "label", "nodeCheckbox", "nodeRenameInput", "root", "tree"), dj = uj.build();
})), pj, mj = t((() => {
	x_(), pj = (e) => new v_(e), pj.empty = () => new v_({ rootNode: { children: [] } });
})), hj, gj, _j, vj, yj, bj, xj, Sj = t((() => {
	hj = (e) => e.ids?.root ?? `tree:${e.id}:root`, gj = (e) => e.ids?.label ?? `tree:${e.id}:label`, _j = (e, t) => e.ids?.node?.(t) ?? `tree:${e.id}:node:${t}`, vj = (e) => e.ids?.tree ?? `tree:${e.id}:tree`, yj = (e, t) => {
		t != null && e.getById(_j(e, t))?.focus();
	}, bj = (e, t) => `tree:${e.id}:rename-input:${t}`, xj = (e, t) => e.getById(bj(e, t));
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+tree-view@1.42.0/node_modules/@zag-js/tree-view/dist/utils/checked-state.mjs
function Cj(e, t, n) {
	let r = e.getNodeValue(t);
	if (!e.isBranchNode(t)) return n.includes(r);
	let i = e.getDescendantValues(r), a = i.every((e) => n.includes(e)), o = i.some((e) => n.includes(e));
	return a ? !0 : o ? "indeterminate" : !1;
}
function wj(e, t, n) {
	let r = e.getDescendantValues(t);
	return Gd(r.every((e) => n.includes(e)) ? Wd(n, ...r) : Ud(n, ...r));
}
function Tj(e, t) {
	let n = /* @__PURE__ */ new Map();
	return e.visit({ onEnter: (r) => {
		let i = e.getNodeValue(r), a = e.isBranchNode(r), o = Cj(e, r, t);
		n.set(i, {
			type: a ? "branch" : "leaf",
			checked: o
		});
	} }), n;
}
var Ej = t((() => {
	X();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+tree-view@1.42.0/node_modules/@zag-js/tree-view/dist/tree-view.connect.mjs
function Dj(e, t) {
	let { context: n, scope: r, computed: i, prop: a, send: o } = e, s = a("collection"), c = a("translations"), l = Array.from(n.get("expandedValue")), u = Array.from(n.get("selectedValue")), d = Array.from(n.get("checkedValue")), f = i("isTypingAhead"), p = n.get("focusedValue"), m = n.get("loadingStatus"), h = n.get("renamingValue"), g = s.getFirstNode(void 0, { skip: ({ indexPath: e }) => s.getValuePath(e).slice(0, -1).some((e) => !l.includes(e)) }), _ = g ? s.getNodeValue(g) : null;
	function v(e) {
		let { node: t, indexPath: n } = e, i = s.getNodeValue(t);
		return {
			id: _j(r, i),
			value: i,
			indexPath: n,
			valuePath: s.getValuePath(n),
			disabled: !!t.disabled,
			focused: p == null ? _ === i : p === i,
			selected: u.includes(i),
			expanded: l.includes(i),
			loading: m[i] === "loading",
			depth: n.length,
			isBranch: s.isBranchNode(t),
			renaming: h === i,
			get checked() {
				return Cj(s, t, d);
			}
		};
	}
	return {
		collection: s,
		expandedValue: l,
		selectedValue: u,
		checkedValue: d,
		toggleChecked(e, t) {
			o({
				type: "CHECKED.TOGGLE",
				value: e,
				isBranch: t
			});
		},
		setChecked(e) {
			o({
				type: "CHECKED.SET",
				value: e
			});
		},
		clearChecked() {
			o({ type: "CHECKED.CLEAR" });
		},
		getCheckedMap() {
			return Tj(s, d);
		},
		expand(e) {
			o({
				type: e ? "BRANCH.EXPAND" : "EXPANDED.ALL",
				value: e
			});
		},
		collapse(e) {
			o({
				type: e ? "BRANCH.COLLAPSE" : "EXPANDED.CLEAR",
				value: e
			});
		},
		deselect(e) {
			o({
				type: e ? "NODE.DESELECT" : "SELECTED.CLEAR",
				value: e
			});
		},
		select(e) {
			o({
				type: e ? "NODE.SELECT" : "SELECTED.ALL",
				value: e,
				isTrusted: !1
			});
		},
		getVisibleNodes() {
			return i("visibleNodes");
		},
		focus(e) {
			yj(r, e);
		},
		selectParent(e) {
			let t = s.getParentNode(e);
			if (!t) return;
			let n = Ud(u, s.getNodeValue(t));
			o({
				type: "SELECTED.SET",
				value: n,
				src: "select.parent"
			});
		},
		expandParent(e) {
			let t = s.getParentNode(e);
			if (!t) return;
			let n = Ud(l, s.getNodeValue(t));
			o({
				type: "EXPANDED.SET",
				value: n,
				src: "expand.parent"
			});
		},
		setExpandedValue(e) {
			let t = Gd(e);
			o({
				type: "EXPANDED.SET",
				value: t
			});
		},
		setSelectedValue(e) {
			let t = Gd(e);
			o({
				type: "SELECTED.SET",
				value: t
			});
		},
		startRenaming(e) {
			o({
				type: "NODE.RENAME",
				value: e
			});
		},
		submitRenaming(e, t) {
			o({
				type: "RENAME.SUBMIT",
				value: e,
				label: t
			});
		},
		cancelRenaming() {
			o({ type: "RENAME.CANCEL" });
		},
		getRootProps() {
			return t.element({
				...dj.root.attrs,
				id: hj(r),
				dir: a("dir")
			});
		},
		getLabelProps() {
			return t.element({
				...dj.label.attrs,
				id: gj(r),
				dir: a("dir")
			});
		},
		getTreeProps() {
			return t.element({
				...dj.tree.attrs,
				id: vj(r),
				dir: a("dir"),
				role: "tree",
				"aria-label": c.treeLabel,
				"aria-labelledby": gj(r),
				"aria-multiselectable": a("selectionMode") === "multiple" || void 0,
				tabIndex: -1,
				onKeyDown(e) {
					if (e.defaultPrevented || Tl(e)) return;
					let t = Sl(e);
					if (Oc(t)) return;
					let n = t?.closest("[data-part=branch-control], [data-part=item]");
					if (!n) return;
					let r = n.dataset.value;
					if (r == null) {
						console.warn("[zag-js/tree-view] Node id not found for node", n);
						return;
					}
					let i = n.matches("[data-part=branch-control]"), c = {
						ArrowDown(e) {
							Fl(e) || (e.preventDefault(), o({
								type: "NODE.ARROW_DOWN",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						ArrowUp(e) {
							Fl(e) || (e.preventDefault(), o({
								type: "NODE.ARROW_UP",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						ArrowLeft(e) {
							Fl(e) || n.dataset.disabled || (e.preventDefault(), o({
								type: i ? "BRANCH_NODE.ARROW_LEFT" : "NODE.ARROW_LEFT",
								id: r
							}));
						},
						ArrowRight(e) {
							!i || n.dataset.disabled || (e.preventDefault(), o({
								type: "BRANCH_NODE.ARROW_RIGHT",
								id: r
							}));
						},
						Home(e) {
							Fl(e) || (e.preventDefault(), o({
								type: "NODE.HOME",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						End(e) {
							Fl(e) || (e.preventDefault(), o({
								type: "NODE.END",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						Space(e) {
							n.dataset.disabled || (f ? o({
								type: "TREE.TYPEAHEAD",
								key: e.key
							}) : c.Enter?.(e));
						},
						Enter(e) {
							n.dataset.disabled || Kc(t) && Fl(e) || (o({
								type: i ? "BRANCH_NODE.CLICK" : "NODE.CLICK",
								id: r,
								src: "keyboard"
							}), Kc(t) || e.preventDefault());
						},
						"*"(e) {
							n.dataset.disabled || (e.preventDefault(), o({
								type: "SIBLINGS.EXPAND",
								id: r
							}));
						},
						a(e) {
							!e.metaKey || n.dataset.disabled || (e.preventDefault(), o({
								type: "SELECTED.ALL",
								moveFocus: !0
							}));
						},
						F2(e) {
							if (n.dataset.disabled) return;
							let t = a("canRename");
							if (!t) return;
							let i = s.getIndexPath(r);
							if (i) {
								let e = s.at(i);
								if (e && !t(e, i)) return;
							}
							e.preventDefault(), o({
								type: "NODE.RENAME",
								value: r
							});
						}
					}, l = c[kl(e, { dir: a("dir") })];
					if (l) {
						l(e);
						return;
					}
					wd.isValidEvent(e) && (o({
						type: "TREE.TYPEAHEAD",
						key: e.key,
						id: r
					}), e.preventDefault());
				}
			});
		},
		getNodeState: v,
		getItemProps(e) {
			let n = v(e);
			return t.element({
				...dj.item.attrs,
				id: n.id,
				dir: a("dir"),
				"data-ownedby": vj(r),
				"data-path": e.indexPath.join("/"),
				"data-value": n.value,
				tabIndex: n.focused ? 0 : -1,
				"data-focus": K(n.focused),
				role: "treeitem",
				"aria-current": n.selected ? "true" : void 0,
				"aria-selected": n.disabled ? void 0 : n.selected,
				"data-selected": K(n.selected),
				"aria-disabled": wc(n.disabled),
				"data-disabled": K(n.disabled),
				"data-renaming": K(n.renaming),
				"data-checked": K(n.checked === !0),
				"data-indeterminate": K(n.checked === "indeterminate"),
				"aria-level": n.depth,
				"data-depth": n.depth,
				style: { "--depth": n.depth },
				onFocus(e) {
					e.stopPropagation(), o({
						type: "NODE.FOCUS",
						id: n.value
					});
				},
				onClick(e) {
					if (n.disabled || !Nl(e) || Kc(e.currentTarget) && Fl(e)) return;
					let t = e.metaKey || e.ctrlKey;
					o({
						type: "NODE.CLICK",
						id: n.value,
						shiftKey: e.shiftKey,
						ctrlKey: t
					}), e.stopPropagation(), Kc(e.currentTarget) || e.preventDefault();
				}
			});
		},
		getItemTextProps(e) {
			let n = v(e);
			return t.element({
				...dj.itemText.attrs,
				"data-disabled": K(n.disabled),
				"data-selected": K(n.selected),
				"data-focus": K(n.focused)
			});
		},
		getItemIndicatorProps(e) {
			let n = v(e);
			return t.element({
				...dj.itemIndicator.attrs,
				"aria-hidden": !0,
				"data-disabled": K(n.disabled),
				"data-selected": K(n.selected),
				"data-focus": K(n.focused),
				hidden: !n.selected
			});
		},
		getBranchProps(e) {
			let n = v(e);
			return t.element({
				...dj.branch.attrs,
				"data-depth": n.depth,
				dir: a("dir"),
				"data-branch": n.value,
				role: "treeitem",
				"data-ownedby": vj(r),
				"data-value": n.value,
				"aria-level": n.depth,
				"aria-selected": n.disabled ? void 0 : n.selected,
				"data-path": e.indexPath.join("/"),
				"data-selected": K(n.selected),
				"aria-expanded": n.expanded,
				"data-state": n.expanded ? "open" : "closed",
				"aria-disabled": wc(n.disabled),
				"data-disabled": K(n.disabled),
				"data-loading": K(n.loading),
				"aria-busy": wc(n.loading),
				style: { "--depth": n.depth }
			});
		},
		getBranchIndicatorProps(e) {
			let n = v(e);
			return t.element({
				...dj.branchIndicator.attrs,
				"aria-hidden": !0,
				"data-state": n.expanded ? "open" : "closed",
				"data-disabled": K(n.disabled),
				"data-selected": K(n.selected),
				"data-focus": K(n.focused),
				"data-loading": K(n.loading)
			});
		},
		getBranchTriggerProps(e) {
			let n = v(e);
			return t.element({
				...dj.branchTrigger.attrs,
				role: "button",
				dir: a("dir"),
				"data-disabled": K(n.disabled),
				"data-state": n.expanded ? "open" : "closed",
				"data-value": n.value,
				"data-loading": K(n.loading),
				disabled: n.loading,
				onClick(e) {
					n.disabled || n.loading || (o({
						type: "BRANCH_TOGGLE.CLICK",
						id: n.value
					}), e.stopPropagation());
				}
			});
		},
		getBranchControlProps(e) {
			let n = v(e);
			return t.element({
				...dj.branchControl.attrs,
				role: "button",
				id: n.id,
				dir: a("dir"),
				tabIndex: n.focused ? 0 : -1,
				"data-path": e.indexPath.join("/"),
				"data-state": n.expanded ? "open" : "closed",
				"data-disabled": K(n.disabled),
				"data-selected": K(n.selected),
				"data-focus": K(n.focused),
				"data-renaming": K(n.renaming),
				"data-checked": K(n.checked === !0),
				"data-indeterminate": K(n.checked === "indeterminate"),
				"data-value": n.value,
				"data-depth": n.depth,
				"data-loading": K(n.loading),
				"aria-busy": wc(n.loading),
				onFocus(e) {
					o({
						type: "NODE.FOCUS",
						id: n.value
					}), e.stopPropagation();
				},
				onClick(e) {
					if (n.disabled || n.loading || !Nl(e) || Kc(e.currentTarget) && Fl(e)) return;
					let t = e.metaKey || e.ctrlKey;
					o({
						type: "BRANCH_NODE.CLICK",
						id: n.value,
						shiftKey: e.shiftKey,
						ctrlKey: t
					}), e.stopPropagation();
				}
			});
		},
		getBranchTextProps(e) {
			let n = v(e);
			return t.element({
				...dj.branchText.attrs,
				dir: a("dir"),
				"data-disabled": K(n.disabled),
				"data-state": n.expanded ? "open" : "closed",
				"data-loading": K(n.loading)
			});
		},
		getBranchContentProps(e) {
			let n = v(e);
			return t.element({
				...dj.branchContent.attrs,
				role: "group",
				dir: a("dir"),
				"data-state": n.expanded ? "open" : "closed",
				"data-depth": n.depth,
				"data-path": e.indexPath.join("/"),
				"data-value": n.value,
				hidden: !n.expanded
			});
		},
		getBranchIndentGuideProps(e) {
			let n = v(e);
			return t.element({
				...dj.branchIndentGuide.attrs,
				"data-depth": n.depth
			});
		},
		getNodeCheckboxProps(e) {
			let n = v(e), r = n.checked;
			return t.element({
				...dj.nodeCheckbox.attrs,
				tabIndex: -1,
				role: "checkbox",
				"data-state": r === !0 ? "checked" : r === !1 ? "unchecked" : "indeterminate",
				"aria-checked": r === !0 ? "true" : r === !1 ? "false" : "mixed",
				"data-disabled": K(n.disabled),
				onClick(e) {
					e.defaultPrevented || n.disabled || Nl(e) && (o({
						type: "CHECKED.TOGGLE",
						value: n.value,
						isBranch: n.isBranch
					}), e.stopPropagation(), e.currentTarget.closest("[role=treeitem]")?.focus({ preventScroll: !0 }));
				}
			});
		},
		getNodeRenameInputProps(e) {
			let n = v(e);
			return t.input({
				...dj.nodeRenameInput.attrs,
				id: bj(r, n.value),
				type: "text",
				"aria-label": c.renameInputLabel,
				hidden: !n.renaming,
				onKeyDown(e) {
					Tl(e) || (e.key === "Escape" && (o({ type: "RENAME.CANCEL" }), e.preventDefault()), e.key === "Enter" && (o({
						type: "RENAME.SUBMIT",
						label: e.currentTarget.value
					}), e.preventDefault()), e.stopPropagation());
				},
				onBlur(e) {
					o({
						type: "RENAME.SUBMIT",
						label: e.currentTarget.value
					});
				}
			});
		}
	};
}
var Oj = t((() => {
	Y(), X(), fj(), Sj(), Ej();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+tree-view@1.42.0/node_modules/@zag-js/tree-view/dist/utils/expand-branch.mjs
function kj(e, t) {
	let { context: n, prop: r, refs: i } = e;
	if (!r("loadChildren")) {
		n.set("expandedValue", (e) => Gd(Ud(e, ...t)));
		return;
	}
	let a = n.get("loadingStatus"), [o, s] = zd(t, (e) => a[e] === "loaded");
	if (o.length > 0 && n.set("expandedValue", (e) => Gd(Ud(e, ...o))), s.length === 0) return;
	let c = r("collection"), [l, u] = zd(s, (e) => {
		let t = c.findNode(e);
		return c.getNodeChildren(t).length > 0;
	});
	if (l.length > 0 && n.set("expandedValue", (e) => Gd(Ud(e, ...l))), u.length === 0) return;
	n.set("loadingStatus", (e) => ({
		...e,
		...u.reduce((e, t) => ({
			...e,
			[t]: "loading"
		}), {})
	}));
	let d = u.map((e) => {
		let t = c.getIndexPath(e);
		return {
			id: e,
			indexPath: t,
			valuePath: c.getValuePath(t),
			node: c.findNode(e)
		};
	}), f = i.get("pendingAborts"), p = r("loadChildren");
	tp(p, () => "[zag-js/tree-view] `loadChildren` is required for async expansion");
	let m = d.map(({ id: e, indexPath: t, valuePath: n, node: r }) => {
		let i = f.get(e);
		i && (i.abort(), f.delete(e));
		let a = new AbortController();
		return f.set(e, a), p({
			valuePath: n,
			indexPath: t,
			node: r,
			signal: a.signal
		});
	});
	Promise.allSettled(m).then((e) => {
		let t = [], i = [], a = n.get("loadingStatus"), o = r("collection");
		e.forEach((e, n) => {
			let { id: r, indexPath: s, node: c, valuePath: l } = d[n];
			e.status === "fulfilled" ? (a[r] = "loaded", t.push(r), o = o.replace(s, {
				...c,
				children: e.value
			})) : (f.delete(r), Reflect.deleteProperty(a, r), i.push({
				node: c,
				error: e.reason,
				indexPath: s,
				valuePath: l
			}));
		}), n.set("loadingStatus", a), t.length && (n.set("expandedValue", (e) => Gd(Ud(e, ...t))), r("onLoadChildrenComplete")?.({ collection: o })), i.length && r("onLoadChildrenError")?.({ nodes: i });
	});
}
var Aj = t((() => {
	X();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+tree-view@1.42.0/node_modules/@zag-js/tree-view/dist/utils/visit-skip.mjs
function jj(e) {
	let { prop: t, context: n } = e;
	return function({ indexPath: e }) {
		return t("collection").getValuePath(e).slice(0, -1).some((e) => !n.get("expandedValue").includes(e));
	};
}
var Mj = t((() => {}));
//#endregion
//#region node_modules/.pnpm/@zag-js+tree-view@1.42.0/node_modules/@zag-js/tree-view/dist/tree-view.machine.mjs
function Nj(e, t) {
	let { prop: n, scope: r, computed: i } = e, a = n("scrollToIndexFn");
	if (!a) return !1;
	let o = n("collection"), s = i("visibleNodes");
	for (let e = 0; e < s.length; e++) {
		let { node: n, indexPath: i } = s[e];
		if (o.getNodeValue(n) === t) return a({
			index: e,
			node: n,
			indexPath: i,
			getElement: () => r.getById(_j(r, t))
		}), !0;
	}
	return !1;
}
var Pj, Fj, Ij = t((() => {
	um(), Y(), X(), mj(), Sj(), Ej(), Aj(), Mj(), {and: Pj} = tm(), Fj = nm({
		props({ props: e }) {
			return {
				selectionMode: "single",
				collection: pj.empty(),
				typeahead: !0,
				expandOnClick: !0,
				defaultExpandedValue: [],
				defaultSelectedValue: [],
				...e,
				translations: {
					treeLabel: "Tree View",
					renameInputLabel: "Rename tree item",
					...e.translations
				}
			};
		},
		initialState() {
			return "idle";
		},
		context({ prop: e, bindable: t, getContext: n }) {
			return {
				expandedValue: t(() => ({
					defaultValue: e("defaultExpandedValue"),
					value: e("expandedValue"),
					isEqual: Zd,
					onChange(t) {
						let r = n().get("focusedValue");
						e("onExpandedChange")?.({
							expandedValue: t,
							focusedValue: r,
							get expandedNodes() {
								return e("collection").findNodes(t);
							}
						});
					}
				})),
				selectedValue: t(() => ({
					defaultValue: e("defaultSelectedValue"),
					value: e("selectedValue"),
					isEqual: Zd,
					onChange(t) {
						let r = n().get("focusedValue");
						e("onSelectionChange")?.({
							selectedValue: t,
							focusedValue: r,
							get selectedNodes() {
								return e("collection").findNodes(t);
							}
						});
					}
				})),
				focusedValue: t(() => ({
					defaultValue: e("defaultFocusedValue") || null,
					value: e("focusedValue"),
					onChange(t) {
						e("onFocusChange")?.({
							focusedValue: t,
							get focusedNode() {
								return t ? e("collection").findNode(t) : null;
							}
						});
					}
				})),
				loadingStatus: t(() => ({ defaultValue: {} })),
				checkedValue: t(() => ({
					defaultValue: e("defaultCheckedValue") || [],
					value: e("checkedValue"),
					isEqual: Zd,
					onChange(t) {
						e("onCheckedChange")?.({ checkedValue: t });
					}
				})),
				renamingValue: t(() => ({
					sync: !0,
					defaultValue: null
				}))
			};
		},
		refs() {
			return {
				typeaheadState: { ...wd.defaultOptions },
				pendingAborts: /* @__PURE__ */ new Map()
			};
		},
		computed: {
			isMultipleSelection: ({ prop: e }) => e("selectionMode") === "multiple",
			isTypingAhead: ({ refs: e }) => e.get("typeaheadState").keysSoFar.length > 0,
			visibleNodes: ({ prop: e, context: t }) => {
				let n = [];
				return e("collection").visit({
					skip: jj({
						prop: e,
						context: t
					}),
					onEnter: (e, t) => {
						n.push({
							node: e,
							indexPath: t
						});
					}
				}), n;
			}
		},
		on: {
			"EXPANDED.SET": { actions: ["setExpanded"] },
			"EXPANDED.CLEAR": { actions: ["clearExpanded"] },
			"EXPANDED.ALL": { actions: ["expandAllBranches"] },
			"BRANCH.EXPAND": { actions: ["expandBranches"] },
			"BRANCH.COLLAPSE": { actions: ["collapseBranches"] },
			"SELECTED.SET": { actions: ["setSelected"] },
			"SELECTED.ALL": [{
				guard: Pj("isMultipleSelection", "moveFocus"),
				actions: ["selectAllNodes", "focusTreeLastNode"]
			}, {
				guard: "isMultipleSelection",
				actions: ["selectAllNodes"]
			}],
			"SELECTED.CLEAR": { actions: ["clearSelected"] },
			"NODE.SELECT": { actions: ["selectNode"] },
			"NODE.DESELECT": { actions: ["deselectNode"] },
			"CHECKED.TOGGLE": { actions: ["toggleChecked"] },
			"CHECKED.SET": { actions: ["setChecked"] },
			"CHECKED.CLEAR": { actions: ["clearChecked"] },
			"NODE.FOCUS": { actions: ["setFocusedNode"] },
			"NODE.ARROW_DOWN": [{
				guard: Pj("isShiftKey", "isMultipleSelection"),
				actions: ["focusTreeNextNode", "extendSelectionToNextNode"]
			}, { actions: ["focusTreeNextNode"] }],
			"NODE.ARROW_UP": [{
				guard: Pj("isShiftKey", "isMultipleSelection"),
				actions: ["focusTreePrevNode", "extendSelectionToPrevNode"]
			}, { actions: ["focusTreePrevNode"] }],
			"NODE.ARROW_LEFT": { actions: ["focusBranchNode"] },
			"BRANCH_NODE.ARROW_LEFT": [{
				guard: "isBranchExpanded",
				actions: ["collapseBranch"]
			}, { actions: ["focusBranchNode"] }],
			"BRANCH_NODE.ARROW_RIGHT": [{
				guard: Pj("isBranchFocused", "isBranchExpanded"),
				actions: ["focusBranchFirstNode"]
			}, { actions: ["expandBranch"] }],
			"SIBLINGS.EXPAND": { actions: ["expandSiblingBranches"] },
			"NODE.HOME": [{
				guard: Pj("isShiftKey", "isMultipleSelection"),
				actions: ["extendSelectionToFirstNode", "focusTreeFirstNode"]
			}, { actions: ["focusTreeFirstNode"] }],
			"NODE.END": [{
				guard: Pj("isShiftKey", "isMultipleSelection"),
				actions: ["extendSelectionToLastNode", "focusTreeLastNode"]
			}, { actions: ["focusTreeLastNode"] }],
			"NODE.CLICK": [
				{
					guard: Pj("isCtrlKey", "isMultipleSelection"),
					actions: ["toggleNodeSelection"]
				},
				{
					guard: Pj("isShiftKey", "isMultipleSelection"),
					actions: ["extendSelectionToNode"]
				},
				{ actions: ["selectNode"] }
			],
			"BRANCH_NODE.CLICK": [
				{
					guard: Pj("isCtrlKey", "isMultipleSelection"),
					actions: ["toggleNodeSelection"]
				},
				{
					guard: Pj("isShiftKey", "isMultipleSelection"),
					actions: ["extendSelectionToNode"]
				},
				{
					guard: "expandOnClick",
					actions: ["selectNode", "toggleBranchNode"]
				},
				{ actions: ["selectNode"] }
			],
			"BRANCH_TOGGLE.CLICK": { actions: ["toggleBranchNode"] },
			"TREE.TYPEAHEAD": { actions: ["focusMatchedNode"] }
		},
		exit: ["clearPendingAborts"],
		states: {
			idle: { on: { "NODE.RENAME": {
				target: "renaming",
				actions: ["setRenamingValue"]
			} } },
			renaming: {
				entry: ["syncRenameInput", "focusRenameInput"],
				on: {
					"RENAME.SUBMIT": {
						guard: "isRenameLabelValid",
						target: "idle",
						actions: ["submitRenaming"]
					},
					"RENAME.CANCEL": {
						target: "idle",
						actions: ["cancelRenaming"]
					}
				}
			}
		},
		implementations: {
			guards: {
				isBranchFocused: ({ context: e, event: t }) => e.get("focusedValue") === t.id,
				isBranchExpanded: ({ context: e, event: t }) => e.get("expandedValue").includes(t.id),
				isShiftKey: ({ event: e }) => e.shiftKey,
				isCtrlKey: ({ event: e }) => e.ctrlKey,
				hasSelectedItems: ({ context: e }) => e.get("selectedValue").length > 0,
				isMultipleSelection: ({ prop: e }) => e("selectionMode") === "multiple",
				moveFocus: ({ event: e }) => !!e.moveFocus,
				expandOnClick: ({ prop: e }) => !!e("expandOnClick"),
				isRenameLabelValid: ({ event: e }) => e.label.trim() !== ""
			},
			actions: {
				selectNode({ context: e, event: t }) {
					let n = t.id || t.value;
					e.set("selectedValue", (e) => n == null ? e : !t.isTrusted && $d(n) ? e.concat(...n) : [$d(n) ? Vd(n) : n].filter(Boolean));
				},
				deselectNode({ context: e, event: t }) {
					let n = Md(t.id || t.value);
					e.set("selectedValue", (e) => Wd(e, ...n));
				},
				setFocusedNode({ context: e, event: t }) {
					e.set("focusedValue", t.id);
				},
				clearFocusedNode({ context: e }) {
					e.set("focusedValue", null);
				},
				clearSelectedItem({ context: e }) {
					e.set("selectedValue", []);
				},
				toggleBranchNode({ context: e, event: t, action: n }) {
					n(e.get("expandedValue").includes(t.id) ? ["collapseBranch"] : ["expandBranch"]);
				},
				expandBranch(e) {
					let { event: t } = e;
					kj(e, [t.id]);
				},
				expandBranches(e) {
					let { context: t, event: n } = e;
					kj(e, Kd(Md(n.value), t.get("expandedValue")));
				},
				collapseBranch({ context: e, event: t }) {
					e.set("expandedValue", (e) => Wd(e, t.id));
				},
				collapseBranches(e) {
					let { context: t, event: n } = e, r = Md(n.value);
					t.set("expandedValue", (e) => Wd(e, ...r));
				},
				setExpanded({ context: e, event: t }) {
					$d(t.value) && e.set("expandedValue", t.value);
				},
				clearExpanded({ context: e }) {
					e.set("expandedValue", []);
				},
				setSelected({ context: e, event: t }) {
					$d(t.value) && e.set("selectedValue", t.value);
				},
				clearSelected({ context: e }) {
					e.set("selectedValue", []);
				},
				focusTreeFirstNode(e) {
					let { prop: t, scope: n } = e, r = t("collection"), i = r.getFirstNode(void 0, { skip: jj(e) });
					if (!i) return;
					let a = r.getNodeValue(i);
					Nj(e, a) ? J(() => yj(n, a)) : yj(n, a);
				},
				focusTreeLastNode(e) {
					let { prop: t, scope: n } = e, r = t("collection"), i = r.getLastNode(void 0, { skip: jj(e) }), a = r.getNodeValue(i);
					Nj(e, a) ? J(() => yj(n, a)) : yj(n, a);
				},
				focusBranchFirstNode(e) {
					let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.findNode(t.id), o = i.getFirstNode(a, { skip: jj(e) });
					if (!o) return;
					let s = i.getNodeValue(o);
					Nj(e, s) ? J(() => yj(r, s)) : yj(r, s);
				},
				focusTreeNextNode(e) {
					let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.getNextNode(t.id, { skip: jj(e) });
					if (!a) return;
					let o = i.getNodeValue(a);
					Nj(e, o) ? J(() => yj(r, o)) : yj(r, o);
				},
				focusTreePrevNode(e) {
					let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.getPreviousNode(t.id, { skip: jj(e) });
					if (!a) return;
					let o = i.getNodeValue(a);
					Nj(e, o) ? J(() => yj(r, o)) : yj(r, o);
				},
				focusBranchNode(e) {
					let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.getParentNode(t.id), o = a ? i.getNodeValue(a) : void 0;
					o && (Nj(e, o) ? J(() => yj(r, o)) : yj(r, o));
				},
				selectAllNodes({ context: e, prop: t }) {
					e.set("selectedValue", t("collection").getValues());
				},
				focusMatchedNode(e) {
					let { context: t, prop: n, refs: r, event: i, scope: a, computed: o } = e, s = wd(o("visibleNodes").map(({ node: e }) => ({
						textContent: n("collection").stringifyNode(e),
						id: n("collection").getNodeValue(e)
					})), {
						state: r.get("typeaheadState"),
						activeId: t.get("focusedValue"),
						key: i.key
					});
					s?.id && (Nj(e, s.id) ? J(() => yj(a, s.id)) : yj(a, s.id));
				},
				toggleNodeSelection({ context: e, event: t }) {
					let n = qd(e.get("selectedValue"), t.id);
					e.set("selectedValue", n);
				},
				expandAllBranches(e) {
					let { context: t, prop: n } = e;
					kj(e, Kd(n("collection").getBranchValues(), t.get("expandedValue")));
				},
				expandSiblingBranches(e) {
					let { context: t, event: n, prop: r } = e, i = r("collection"), a = i.getIndexPath(n.id);
					a && kj(e, Kd(i.getSiblingNodes(a).map((e) => i.getNodeValue(e)), t.get("expandedValue")));
				},
				extendSelectionToNode(e) {
					let { context: t, event: n, prop: r, computed: i } = e, a = r("collection"), o = Bd(t.get("selectedValue")) || a.getNodeValue(a.getFirstNode()), s = n.id, c = [o, s], l = 0;
					i("visibleNodes").forEach(({ node: e }) => {
						let t = a.getNodeValue(e);
						l === 1 && c.push(t), (t === o || t === s) && l++;
					}), t.set("selectedValue", Gd(c));
				},
				extendSelectionToNextNode(e) {
					let { context: t, event: n, prop: r } = e, i = r("collection"), a = i.getNextNode(n.id, { skip: jj(e) });
					if (!a) return;
					let o = new Set(t.get("selectedValue")), s = i.getNodeValue(a);
					s != null && (o.has(n.id) && o.has(s) ? o.delete(n.id) : o.has(s) || o.add(s), t.set("selectedValue", Array.from(o)));
				},
				extendSelectionToPrevNode(e) {
					let { context: t, event: n, prop: r } = e, i = r("collection"), a = i.getPreviousNode(n.id, { skip: jj(e) });
					if (!a) return;
					let o = new Set(t.get("selectedValue")), s = i.getNodeValue(a);
					s != null && (o.has(n.id) && o.has(s) ? o.delete(n.id) : o.has(s) || o.add(s), t.set("selectedValue", Array.from(o)));
				},
				extendSelectionToFirstNode(e) {
					let { context: t, prop: n } = e, r = n("collection"), i = Bd(t.get("selectedValue")), a = [];
					r.visit({
						skip: jj(e),
						onEnter: (e) => {
							let t = r.getNodeValue(e);
							if (a.push(t), t === i) return "stop";
						}
					}), t.set("selectedValue", a);
				},
				extendSelectionToLastNode(e) {
					let { context: t, prop: n } = e, r = n("collection"), i = Bd(t.get("selectedValue")), a = [], o = !1;
					r.visit({
						skip: jj(e),
						onEnter: (e) => {
							let t = r.getNodeValue(e);
							t === i && (o = !0), o && a.push(t);
						}
					}), t.set("selectedValue", a);
				},
				clearPendingAborts({ refs: e }) {
					let t = e.get("pendingAborts");
					t.forEach((e) => e.abort()), t.clear();
				},
				toggleChecked({ context: e, event: t, prop: n }) {
					let r = n("collection");
					e.set("checkedValue", (e) => t.isBranch ? wj(r, t.value, e) : qd(e, t.value));
				},
				setChecked({ context: e, event: t }) {
					e.set("checkedValue", t.value);
				},
				clearChecked({ context: e }) {
					e.set("checkedValue", []);
				},
				setRenamingValue({ context: e, event: t, prop: n }) {
					e.set("renamingValue", t.value);
					let r = n("onRenameStart");
					if (r) {
						let e = n("collection"), i = e.getIndexPath(t.value);
						if (i) {
							let n = e.at(i);
							n && r({
								value: t.value,
								node: n,
								indexPath: i
							});
						}
					}
				},
				submitRenaming({ context: e, event: t, prop: n, scope: r }) {
					let i = e.get("renamingValue");
					if (!i) return;
					let a = n("collection").getIndexPath(i);
					if (!a) return;
					let o = t.label.trim(), s = n("onBeforeRename");
					if (s && !s({
						value: i,
						label: o,
						indexPath: a
					})) {
						e.set("renamingValue", null), yj(r, i);
						return;
					}
					n("onRenameComplete")?.({
						value: i,
						label: o,
						indexPath: a
					}), e.set("renamingValue", null), yj(r, i);
				},
				cancelRenaming({ context: e, scope: t }) {
					let n = e.get("renamingValue");
					e.set("renamingValue", null), n && yj(t, n);
				},
				syncRenameInput({ context: e, scope: t, prop: n }) {
					let r = e.get("renamingValue");
					if (!r) return;
					let i = n("collection"), a = i.findNode(r);
					if (!a) return;
					let o = i.stringifyNode(a);
					Wl(xj(t, r), o);
				},
				focusRenameInput({ context: e, scope: t }) {
					let n = e.get("renamingValue");
					if (!n) return;
					let r = xj(t, n);
					r && (r.focus(), r.select());
				}
			}
		}
	});
})), Lj = t((() => {})), Rj = t((() => {
	mj(), Oj(), Ij(), Lj();
})), zj = t((() => {
	ym(), $m(), ph(), lc(), Y(), X(), um(), _m(), eg(), Dg(), _x(), zx(), OS(), tD(), TO(), eA(), lj(), Rj();
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+svelte@1.42.0_svelte@5.56.7/node_modules/@zag-js/svelte/dist/normalize-props.js
function Bj(e) {
	let t = "";
	for (let n in e) {
		let r = e[n];
		r != null && (n.startsWith("--") || (n = n.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`)), t += `${n}:${r};`);
	}
	return t;
}
function Vj(e) {
	return e in Uj ? Uj[e] : Wj.has(e) ? e : e.toLowerCase();
}
function Hj(e, t) {
	return e === "style" && typeof t == "object" ? Bj(t) : t;
}
var Uj, Wj, Gj, Kj = t((() => {
	_m(), Uj = {
		className: "class",
		defaultChecked: "checked",
		defaultValue: "value",
		htmlFor: "for",
		onBlur: "onfocusout",
		onChange: "oninput",
		onFocus: "onfocusin",
		onDoubleClick: "ondblclick"
	}, Wj = new Set("viewBox,className,preserveAspectRatio,fillRule,clipPath,clipRule,strokeWidth,strokeLinecap,strokeLinejoin,strokeDasharray,strokeDashoffset,strokeMiterlimit".split(",")), Gj = mm((e) => {
		let t = {};
		for (let n in e) t[Vj(n)] = Hj(n, e[n]);
		return t;
	});
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+svelte@1.42.0_svelte@5.56.7/node_modules/@zag-js/svelte/dist/bindable.svelte.js
function qj(e) {
	let t = e().defaultValue ?? e().value, n = e().isEqual ?? Object.is, r = /* @__PURE__ */ or(_r(t)), i = /* @__PURE__ */ R(() => e().value !== void 0), a = { current: ki(() => V(r)) }, o = { current: void 0 };
	Kr(() => {
		let t = V(i) ? e().value : V(r);
		a = { current: t }, o = { current: t };
	});
	let s = (t) => {
		let s = af(t) ? t(a.current) : t, c = o.current;
		e().debug && console.log(`[bindable > ${e().debug}] setValue`, {
			next: s,
			prev: c
		}), V(i) || cr(r, s, !0), n(s, c) || e().onChange?.(s, c);
	};
	function c() {
		return V(i) ? e().value : V(r);
	}
	return {
		initial: t,
		ref: a,
		get: c,
		set(t) {
			let n = e().sync ? Ln : xf;
			ki(() => n(() => s(t)));
		},
		invoke(t, n) {
			e().onChange?.(t, n);
		},
		hash(t) {
			return e().hash?.(t) ?? String(t);
		}
	};
}
var Jj = t((() => {
	vs(), X(), Cs(), qj.cleanup = (e) => {
		xs(() => e());
	}, qj.ref = (e) => {
		let t = e;
		return {
			get: () => t,
			set: (e) => {
				t = e;
			}
		};
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+svelte@1.42.0_svelte@5.56.7/node_modules/@zag-js/svelte/dist/refs.svelte.js
function Yj(e) {
	let t = { current: e };
	return {
		get(e) {
			return t.current[e];
		},
		set(e, n) {
			t.current[e] = n;
		}
	};
}
var Xj = t((() => {
	vs();
})), Zj, Qj, $j = t((() => {
	vs(), X(), Zj = (e) => typeof e == "function" ? e() : e, Qj = (e, t) => {
		let n = [], r = !0;
		Wr(() => {
			if (r) {
				n = e.map((e) => Zj(e)), r = !1;
				return;
			}
			let i = !1;
			for (let t = 0; t < e.length; t++) if (!Zd(n[t], Zj(e[t]))) {
				i = !0;
				break;
			}
			i && (n = e.map((e) => Zj(e)), t());
		});
	};
}));
//#endregion
//#region node_modules/.pnpm/@zag-js+svelte@1.42.0_svelte@5.56.7/node_modules/@zag-js/svelte/dist/machine.svelte.js
function eM(e) {
	return af(e) ? e() : e;
}
function tM(e, t) {
	let n = /* @__PURE__ */ R(() => {
		let { id: e, ids: n, getRootNode: r } = eM(t);
		return cm({
			id: e,
			ids: n,
			getRootNode: r
		});
	}), r = (...t) => {
		e.debug && console.log(...t);
	}, i = /* @__PURE__ */ R(() => e.props?.({
		props: Jf(eM(t)),
		scope: V(n)
	}) ?? eM(t)), a = nM(() => V(i)), o = e.context?.({
		prop: a,
		bindable: qj,
		get scope() {
			return V(n);
		},
		flush: rM,
		getContext() {
			return s;
		},
		getComputed() {
			return b;
		},
		getRefs() {
			return m;
		},
		getEvent() {
			return f();
		}
	}), s = {
		get(e) {
			return o?.[e].get();
		},
		set(e, t) {
			o?.[e].set(t);
		},
		initial(e) {
			return o?.[e].initial;
		},
		hash(e) {
			let t = o?.[e].get();
			return o?.[e].hash(t);
		}
	}, c = /* @__PURE__ */ new Map(), l = { current: null }, u = { current: null }, d = { current: { type: "" } }, f = () => ({
		...d.current,
		current() {
			return d.current;
		},
		previous() {
			return u.current;
		}
	}), p = () => ({
		...x,
		hasTag(t) {
			return Yp(e, x.get(), t);
		},
		matches(...e) {
			let t = x.get();
			return e.some((e) => Jp(t, e));
		}
	}), m = Yj(e.refs?.({
		prop: a,
		context: s
	}) ?? {}), h = () => ({
		state: p(),
		context: s,
		event: f(),
		prop: a,
		send: C,
		action: g,
		guard: _,
		track: Qj,
		refs: m,
		computed: b,
		flush: rM,
		scope: V(n),
		choose: y
	}), g = (t) => {
		let n = af(t) ? t(h()) : t;
		if (!n) return;
		let r = n.map((t) => {
			let n = e.implementations?.actions?.[t];
			return n || $f(`[zag-js] No implementation found for action "${JSON.stringify(t)}"`), n;
		});
		for (let e of r) e?.(h());
	}, _ = (t) => {
		if (af(t)) return t(h());
		let n = e.implementations?.guards?.[t];
		return n || $f(`[zag-js] No implementation found for guard "${JSON.stringify(t)}"`), n?.(h());
	}, v = (t) => {
		let n = af(t) ? t(h()) : t;
		if (!n) return;
		let r = n.map((t) => {
			let n = e.implementations?.effects?.[t];
			return n || $f(`[zag-js] No implementation found for effect "${JSON.stringify(t)}"`), n;
		}), i = [];
		for (let e of r) {
			let t = e?.(h());
			t && i.push(t);
		}
		return () => i.forEach((e) => e?.());
	}, y = (e) => Md(e).find((e) => {
		let t = !e.guard;
		return rf(e.guard) ? t = !!_(e.guard) : af(e.guard) && (t = e.guard(h())), t;
	}), b = (t) => {
		tp(e.computed, () => "[zag-js] No computed object found on machine");
		let r = e.computed[t];
		return r({
			context: s,
			event: f(),
			prop: a,
			refs: m,
			scope: V(n),
			computed: b
		});
	}, x = qj(() => ({
		defaultValue: Gp(e, e.initialState({ prop: a })),
		onChange(t, n) {
			let { exiting: r, entering: i } = qp(e, n, t, l.current?.reenter);
			if (r.forEach((e) => {
				c.get(e.path)?.(), c.delete(e.path);
			}), r.forEach((e) => {
				g(e.state?.exit);
			}), g(l.current?.actions), i.forEach((e) => {
				let t = v(e.state?.effects);
				if (t) {
					let n = c.get(e.path);
					c.set(e.path, n ? Cf(n, t) : t);
				}
			}), n === "__init__") {
				g(e.entry);
				let t = v(e.effects);
				if (t) {
					let e = c.get(om);
					c.set(om, e ? Cf(e, t) : t);
				}
			}
			i.forEach((e) => {
				g(e.state?.entry);
			});
		}
	})), S = am.NotStarted;
	bs(() => {
		let e = S === am.Started;
		S = am.Started, r(e ? "rehydrating..." : "initializing..."), x.invoke(x.initial, om);
	}), xs(() => {
		r("unmounting..."), S = am.Stopped, c.forEach((e) => e?.()), c = /* @__PURE__ */ new Map(), l.current = null, g(e.exit);
	});
	let C = (t) => {
		if (S !== am.Started) return;
		u.current = d.current, d.current = t;
		let n = x.get(), { transitions: i, source: a } = Kp(e, n, t.type), o = y(i);
		if (!o) return;
		l.current = o;
		let s = Gp(e, o.target ?? n, a);
		r("transition", t.type, o.target || n, `(${o.actions})`), s === n ? o.reenter ? x.invoke(n, n) : g(o.actions) : x.set(s);
	};
	return e.watch?.(h()), {
		get state() {
			return p();
		},
		send: C,
		context: s,
		prop: a,
		get scope() {
			return V(n);
		},
		refs: m,
		computed: b,
		get event() {
			return f();
		},
		getStatus: () => S
	};
}
function nM(e) {
	return function(t) {
		return e()[t];
	};
}
function rM(e) {
	Ln(() => {
		queueMicrotask(() => e());
	});
}
var iM = t((() => {
	vs(), um(), X(), Cs(), Jj(), Xj(), $j();
})), aM = t((() => {
	um(), Kj(), iM(), vs();
}));
//#endregion
//#region packages/vanilla/src/components/Select.svelte
function oM(e, t) {
	Ft(t, !0);
	let n = Is(), r = {
		hidden: "[data-sk-select-hidden]",
		label: "[data-sk-select-label]",
		control: "[data-sk-select-control]",
		trigger: "[data-sk-select-trigger]",
		value: "[data-sk-select-value]",
		indicator: "[data-sk-select-indicator]",
		positioner: "[data-sk-select-positioner]",
		content: "[data-sk-select-content]",
		item: "[data-sk-select-item]",
		itemText: "[data-sk-select-item-text]",
		itemIndicator: "[data-sk-select-item-indicator]"
	}, i = n.querySelector(r.trigger), a = n.querySelector(r.value), o = n.querySelector(r.content), s = n.querySelector(r.positioner), c = Array.from(n.querySelectorAll(r.item));
	if (!i) throw Error("Select requires a [data-sk-select-trigger] element.");
	if (!o) throw Error("Select requires a [data-sk-select-content] element.");
	if (c.length === 0) throw Error("Select requires at least one [data-sk-select-item].");
	function l(e) {
		let t = e.dataset.value;
		if (!t) throw Error("Every [data-sk-select-item] needs a non-empty data-value.");
		return {
			value: t,
			label: (e.querySelector(r.itemText) ?? e).textContent?.trim() || t,
			disabled: e.hasAttribute("data-disabled")
		};
	}
	function u(e, t) {
		let n = Array.from(e.options).map((e) => e.value), r = t.map((e) => e.value);
		if (n.join(" ") !== r.join(" ")) throw Error(`Select hidden select drifted from its items: [${n.join(", ")}] vs [${r.join(", ")}].`);
	}
	let d = c.map(l), f = n.querySelector(r.hidden);
	f && u(f, d);
	let p = S_({
		items: d,
		itemToString: (e) => e.label,
		itemToValue: (e) => e.value,
		isItemDisabled: (e) => !!e.disabled
	}), m = n.dataset.placeholder ?? "", h = n.id || Ps("sk-select"), g = Gs() ? Ks(h) : null, _;
	function v() {
		let e = {}, t = (t, n) => {
			n?.id && (e[t] = n.id);
		};
		return t("root", n), t("trigger", i), t("content", o), t("hiddenSelect", f), t("control", n.querySelector(r.control)), t("label", n.querySelector(r.label)), t("positioner", n.querySelector(r.positioner)), e;
	}
	let y = () => {
		let e = n.dataset.value;
		return e ? [e] : void 0;
	}, b = v(), x = tM(mx, () => ({
		id: h,
		ids: b,
		collection: p,
		name: f?.name ?? n.dataset.name,
		disabled: n.hasAttribute("data-disabled"),
		required: n.hasAttribute("data-required"),
		defaultValue: y(),
		positioning: {
			placement: "bottom-start",
			sameWidth: !0,
			gutter: 8,
			flip: !0,
			boundary: n.closest("dialog") ? document.documentElement : void 0
		},
		onValueChange(e) {
			let t = { value: e.value };
			n.dispatchEvent(new CustomEvent(tc.valueChange, {
				bubbles: !0,
				detail: t
			}));
		}
	})), S = /* @__PURE__ */ R(() => Tb(x, Gj));
	Wr(() => {
		T(n, V(S).getRootProps()), f && T(f, V(S).getHiddenSelectProps());
		let e = n.querySelector(r.label);
		e && T(e, V(S).getLabelProps());
		let t = n.querySelector(r.control);
		t && T(t, V(S).getControlProps()), T(i, V(S).getTriggerProps()), a && T(a, V(S).getValueTextProps());
		let l = n.querySelector(r.indicator);
		l && T(l, V(S).getIndicatorProps());
		let u = V(S).getPositionerProps();
		s && T(s, g ? Js(u) : u), T(o, V(S).getContentProps()), c.forEach((e, t) => {
			let n = d[t], i = V(S).getItemProps({ item: n });
			i["aria-selected"] = n.value === V(S).highlightedValue ? "true" : void 0, T(e, i);
			let a = e.querySelector(r.itemText);
			a && T(a, V(S).getItemTextProps({ item: n }));
			let o = e.querySelector(r.itemIndicator);
			o && T(o, V(S).getItemIndicatorProps({ item: n }));
		}), a && (a.textContent = V(S).valueAsString || m), g && s && (_ = qs(i, s, g));
	});
	let C = [];
	bs(() => {
		C.push(D(i, () => V(S).getTriggerProps())), o && C.push(D(o, () => V(S).getContentProps())), c.forEach((e, t) => {
			let n = d[t];
			C.push(D(e, () => V(S).getItemProps({ item: n })));
		});
	}), xs(() => {
		for (let e of C) e();
		_?.();
	}), It();
}
var sM = t((() => {
	Ts(), vs(), ec(), ic(), zj(), aM(), Cs(), k(), G();
})), cM = /* @__PURE__ */ n({ mountSelect: () => lM }), lM, uM = t((() => {
	sM(), G(), lM = js({
		key: "select",
		rootSelector: "[data-sk-select]",
		Component: oM
	});
})), dM, fM = t((() => {
	dM = {
		root: "sk-segmented",
		option: "sk-segmented__option",
		indicator: "sk-segmented__indicator"
	};
})), pM = /* @__PURE__ */ n({
	connectSegmented: () => mM,
	mountSegmented: () => xM
});
function mM(e) {
	let t = Array.from(e.querySelectorAll(bM));
	if (t.length === 0) throw Error(`${dM.root} requires option parts.`);
	for (let e of t) _M(e);
	let n = e.getAttribute("data-value") ?? t.find((e) => e.getAttribute("aria-checked") === "true" && !vM(e))?.getAttribute("data-value") ?? t.find((e) => !vM(e))?.getAttribute("data-value"), r = t.find((e) => _M(e) === n);
	if (!n || !r || vM(r)) throw Error(`${dM.root} needs a data-value that matches an enabled option.`);
	let i = e.querySelector(`.${dM.indicator}`), a = () => {
		x(e, {
			role: "radiogroup",
			"data-value": n
		});
		for (let e of t) {
			let t = _M(e) === n, r = vM(e);
			x(e, {
				role: "radio",
				type: e instanceof HTMLButtonElement ? "button" : null,
				tabindex: t && !r ? 0 : -1,
				"aria-checked": t ? "true" : "false",
				"aria-disabled": r ? "true" : null
			});
		}
		hM(e, i);
	}, o = (r) => {
		let i = t.find((e) => _M(e) === r);
		!i || vM(i) || r === n || (n = r, a(), e.dispatchEvent(new CustomEvent("sk-value-change", {
			bubbles: !0,
			detail: { value: n }
		})));
	}, s = t.map((e) => S(e, {
		click: () => o(_M(e)),
		keydown: (n) => gM(n, e, t, o)
	})), c = typeof ResizeObserver > "u" ? void 0 : new ResizeObserver(() => hM(e, i));
	return c?.observe(e), a(), () => {
		for (let e of s) e();
		c?.disconnect(), e.removeAttribute("data-sk-segmented-ready");
	};
}
function hM(e, t) {
	if (!t) return;
	let n = e.querySelector(`${bM}[aria-checked="true"]`);
	n && (t.style.transform = `translate3d(${n.offsetLeft}px, ${n.offsetTop}px, 0)`, t.style.inlineSize = `${n.offsetWidth}px`, t.style.blockSize = `${n.offsetHeight}px`, e.setAttribute("data-sk-segmented-ready", ""));
}
function gM(e, t, n, r) {
	if (!(e instanceof KeyboardEvent)) return;
	let i = n.filter((e) => !vM(e)), a = i.indexOf(t);
	if (a === -1) return;
	let o = e.key === "Home" ? i[0] : e.key === "End" ? i.at(-1) : e.key === "ArrowLeft" || e.key === "ArrowUp" ? i[(a - 1 + i.length) % i.length] : e.key === "ArrowRight" || e.key === "ArrowDown" ? i[(a + 1) % i.length] : void 0;
	o && (e.preventDefault(), o.focus(), r(_M(o)));
}
function _M(e) {
	let t = e.getAttribute("data-value");
	if (!t) throw Error(`${dM.option} parts need a non-empty data-value attribute.`);
	return t;
}
function vM(e) {
	return e.hasAttribute("data-disabled") || e.getAttribute("aria-disabled") === "true" || e instanceof HTMLButtonElement && e.disabled;
}
var yM, bM, xM, SM = t((() => {
	fM(), k(), G(), yM = "[data-sk-segmented]", bM = "[data-sk-segmented-option]", xM = Ms({
		key: "segmented",
		rootSelector: yM,
		connect: mM
	});
}));
//#endregion
//#region packages/core/src/stat.ts
function CM(e) {
	let t = e.from ?? 0, { to: n, duration: r, onUpdate: i, onComplete: a } = e, o = e.easing ?? MM;
	if (!(r > 0) || t === n) return i(n), a?.(), { stop: () => void 0 };
	let s = 0, c = !1, l = performance.now(), u = (e) => {
		if (c) return;
		let d = OM((e - l) / r);
		if (i(t + (n - t) * o(d)), d < 1) {
			s = requestAnimationFrame(u);
			return;
		}
		i(n), a?.();
	};
	return s = requestAnimationFrame(u), { stop: () => {
		c = !0, s && cancelAnimationFrame(s);
	} };
}
function wM(e) {
	return kM(getComputedStyle(e).getPropertyValue("--sk-stat-count-duration").trim()) ?? 1600;
}
function TM(e, t = {}) {
	let n = t.fractionDigits ?? EM(e), r = new Intl.NumberFormat(t.locale, {
		minimumFractionDigits: n,
		maximumFractionDigits: n
	}).format(e);
	return `${t.prefix ?? ""}${r}${t.suffix ?? ""}`;
}
function EM(e) {
	if (!Number.isFinite(e)) return 0;
	let t = String(e), n = t.indexOf(".");
	return n === -1 ? 0 : t.length - n - 1;
}
function DM(e = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")) {
	return e?.matches ?? !1;
}
function OM(e) {
	return e < 0 ? 0 : e > 1 ? 1 : e;
}
function kM(e) {
	if (!e) return;
	if (e.endsWith("ms")) {
		let t = Number.parseFloat(e);
		return Number.isFinite(t) ? t : void 0;
	}
	if (e.endsWith("s")) {
		let t = Number.parseFloat(e);
		return Number.isFinite(t) ? t * 1e3 : void 0;
	}
	let t = Number.parseFloat(e);
	return Number.isFinite(t) ? t : void 0;
}
var AM, jM, MM, NM = t((() => {
	AM = {
		root: "sk-stat",
		label: "sk-stat__label",
		value: "sk-stat__value",
		valueSizer: "sk-stat__value-sizer",
		valueTick: "sk-stat__value-tick",
		change: "sk-stat__change"
	}, jM = {
		root: "data-sk-stat",
		animate: "data-animate",
		count: "data-count",
		from: "data-from",
		prefix: "data-prefix",
		suffix: "data-suffix",
		locale: "data-locale",
		fractionDigits: "data-fraction-digits"
	}, MM = (e) => 1 - (1 - OM(e)) ** 3;
})), PM = /* @__PURE__ */ n({
	connectStat: () => FM,
	mountStat: () => RM
});
function FM(e) {
	let t = e.querySelector(`.${AM.value}`);
	if (!t) throw Error(`${AM.root}[${jM.animate}] needs a .${AM.value}.`);
	let n = t.getAttribute(jM.count);
	if (n == null || n === "") throw Error(`.${AM.value} needs a finite ${jM.count} when ${jM.animate} is set.`);
	let r = Number(n);
	if (!Number.isFinite(r)) throw Error(`.${AM.value} needs a finite ${jM.count} when ${jM.animate} is set.`);
	let i = t.getAttribute(jM.from), a = i == null || i === "" ? 0 : Number(i);
	if (!Number.isFinite(a)) throw Error(`${jM.from} must be a finite number when present.`);
	let o = t.getAttribute(jM.fractionDigits), s = o == null || o === "" ? EM(r) : Number.parseInt(o, 10);
	if (!Number.isFinite(s)) throw Error(`${jM.fractionDigits} must be an integer when present.`);
	let c = (e) => TM(e, {
		locale: t.getAttribute(jM.locale) ?? void 0,
		prefix: t.getAttribute(jM.prefix) ?? void 0,
		suffix: t.getAttribute(jM.suffix) ?? void 0,
		fractionDigits: s
	}), l = t.textContent?.trim() || c(r), u = IM(t, l), d, f, p = !1, m = () => {
		if (p) return;
		let t = DM() ? 0 : wM(e);
		d?.stop(), d = CM({
			from: a,
			to: r,
			duration: t,
			onUpdate: (e) => {
				u.textContent = c(e);
			},
			onComplete: () => {
				u.textContent = l;
			}
		});
	};
	return typeof IntersectionObserver > "u" ? m() : (f = new IntersectionObserver((e) => {
		e.some((e) => e.isIntersecting) && (f?.disconnect(), f = void 0, m());
	}, { threshold: .2 }), f.observe(e)), () => {
		p = !0, f?.disconnect(), d?.stop(), u.textContent = l;
	};
}
function IM(e, t) {
	let n = e.querySelector(`.${AM.valueTick}`);
	if (n) {
		let r = e.querySelector(`.${AM.valueSizer}`);
		return r && (r.textContent = t), n.textContent = t, n;
	}
	let r = e.ownerDocument.createElement("span");
	r.className = AM.valueSizer, r.setAttribute("aria-hidden", "true"), r.textContent = t;
	let i = e.ownerDocument.createElement("span");
	return i.className = AM.valueTick, i.textContent = t, e.replaceChildren(r, i), i;
}
var LM, RM, zM = t((() => {
	NM(), G(), LM = `[${jM.root}][${jM.animate}]`, RM = Ms({
		key: "stat",
		rootSelector: LM,
		connect: FM
	});
}));
//#endregion
//#region packages/core/src/splitter.ts
function BM(e, t = {}) {
	let n = t.step ?? qM.step, r = t.coarseStep ?? qM.coarseStep, i = e.shiftKey ? r : n;
	switch (e.key) {
		case "ArrowLeft": return {
			kind: "delta",
			delta: -i
		};
		case "ArrowRight": return {
			kind: "delta",
			delta: i
		};
		case "Home": return { kind: "home" };
		case "End": return { kind: "end" };
		case "Enter": return { kind: "reset" };
		default: return { kind: "none" };
	}
}
function VM(e, t, n = qM.dragThreshold) {
	return Math.abs(t - e) >= n;
}
function HM(e, t, n) {
	return n > t ? Math.round((Math.min(Math.max(e, t), n) - t) / (n - t) * 100) : 100;
}
function UM(e) {
	return e === "rtl" ? -1 : 1;
}
function WM(e) {
	let { widths: t, index: n, delta: r, min: i } = e, a = t[n], o = t[n + 1];
	if (a === void 0 || o === void 0) return t;
	let s = a + o, c = Math.min(Math.max(a + r, i), s - i), l = t.slice();
	return l[n] = c, l[n + 1] = s - c, l;
}
function GM(e, t) {
	if (!e) return null;
	let n = e.split(",").map((e) => Number.parseFloat(e.trim()));
	return n.length !== t || n.some((e) => !Number.isFinite(e) || e <= 0) ? null : n;
}
function KM(e) {
	let { total: t, weights: n, min: r } = e;
	if (n.length === 0) return [];
	let i = Math.max(0, t - r * n.length), a = n.reduce((e, t) => e + t, 0) || n.length;
	return n.map((e) => r + i * e / a);
}
var qM, JM = t((() => {
	qM = {
		dragThreshold: 4,
		step: 16,
		coarseStep: 64
	};
}));
//#endregion
//#region packages/core/src/storage.ts
function YM(e) {
	return e;
}
function XM(e) {
	if (!e) return {};
	try {
		let t = JSON.parse(e);
		return typeof t != "object" || !t || Array.isArray(t) ? {} : t;
	} catch {
		return {};
	}
}
function ZM(e) {
	return JSON.stringify(e);
}
function QM(e, t) {
	let n = t.parse(e[t.slot]);
	return n === void 0 ? t.fallback : n;
}
function $M(e, t, n) {
	return {
		...e,
		[t.slot]: n
	};
}
function eN(e, t) {
	let { [t.slot]: n, ...r } = e;
	return r;
}
function tN(e = -Infinity, t = Infinity) {
	return (n) => typeof n == "number" && Number.isFinite(n) && n >= e && n <= t ? n : void 0;
}
var nN = t((() => {}));
//#endregion
//#region packages/core/src/sidebar.ts
function rN(e) {
	return YM({
		slot: `sidebar-width:${e}`,
		fallback: null,
		parse: (e) => tN(0, 1e4)(e)
	});
}
var iN, aN, oN, sN = t((() => {
	JM(), nN(), iN = {
		collapsedChange: "sk-collapsed-change",
		resizeChange: "sk-resize-change"
	}, aN = "--sk-sidebar-resize-inline-size", oN = HM;
}));
//#endregion
//#region packages/vanilla/src/storage.ts
function cN() {
	if (gN === !1) return null;
	try {
		let e = "__sk_probe__";
		return window.localStorage.setItem(e, e), window.localStorage.removeItem(e), gN = !0, window.localStorage;
	} catch {
		return gN = !1, null;
	}
}
function lN() {
	let e = cN();
	if (!e) return hN;
	try {
		return XM(e.getItem("sk"));
	} catch {
		return hN;
	}
}
function uN(e) {
	hN = e;
	let t = cN();
	if (t) try {
		t.setItem("sk", ZM(e));
	} catch {}
}
function dN(e) {
	return QM(lN(), e);
}
function fN(e, t) {
	uN($M(lN(), e, t)), mN(e.slot);
}
function pN(e) {
	uN(eN(lN(), e)), mN(e.slot);
}
function mN(e) {
	typeof window > "u" || window.dispatchEvent(new CustomEvent(_N, { detail: { slot: e } }));
}
var hN, gN, _N, vN = t((() => {
	nN(), hN = {}, gN = null, _N = "sk-storage-change";
})), yN = /* @__PURE__ */ n({
	connectSidebar: () => bN,
	mountSidebar: () => DN
});
function bN(e, t = {}) {
	let n = e.querySelector(wN), r = e.querySelector(TN), i = e.querySelector(EN);
	if (!n && !i) throw Error("Sidebar requires a [data-sk-sidebar-trigger] or a [data-sk-sidebar-resize] element.");
	let a = t.id ?? (e.id || `sk-sidebar-${Math.random().toString(36).slice(2)}`), o = t.collapsed !== void 0, s = t.collapsed ?? t.defaultCollapsed ?? !1;
	r && !r.id && (r.id = `${a}-content`);
	let c = () => {
		x(e, { "data-state": s ? "collapsed" : "expanded" }), n && x(n, {
			type: n.tagName === "BUTTON" ? "button" : null,
			"aria-expanded": String(!s),
			"aria-controls": r?.id ?? null
		});
	}, l = (n) => {
		s = o ? !!t.collapsed : n, c();
		let r = { collapsed: s };
		t.onCollapsedChange?.(r), e.dispatchEvent(new CustomEvent(iN.collapsedChange, {
			bubbles: !0,
			detail: r
		}));
	}, u = [];
	return n && u.push(S(n, { click: () => l(!s) })), i && u.push(SN(e, i, t)), c(), () => {
		for (let e of u) e();
	};
}
function xN(e) {
	let t = e.style.getPropertyValue(aN), n = e.hasAttribute("data-resizing");
	e.setAttribute("data-resizing", ""), e.style.setProperty(aN, "0px");
	let r = e.getBoundingClientRect().width;
	e.style.setProperty(aN, "100000px");
	let i = e.getBoundingClientRect().width;
	return t ? e.style.setProperty(aN, t) : e.style.removeProperty(aN), n || e.removeAttribute("data-resizing"), {
		min: r,
		max: i
	};
}
function SN(e, t, n) {
	let r = n.storageKey ? rN(n.storageKey) : null;
	n.minInlineSize && e.style.setProperty("--sk-sidebar-min-inline-size", n.minInlineSize), n.maxInlineSize && e.style.setProperty("--sk-sidebar-max-inline-size", n.maxInlineSize);
	let i = xN(e), a = () => e.getBoundingClientRect().width, o = () => {
		i.max > i.min && x(t, { "aria-valuenow": String(oN(a(), i.min, i.max)) });
	}, s = (t) => {
		t === null ? e.style.removeProperty(aN) : e.style.setProperty(aN, `${Math.round(t)}px`), o();
	}, c = () => {
		let t = { inlineSize: a() };
		n.onResizeChange?.(t), e.dispatchEvent(new CustomEvent(iN.resizeChange, {
			bubbles: !0,
			detail: t
		}));
	}, l = () => {
		r && fN(r, a()), c();
	}, u = (t) => {
		let n = e.hasAttribute("data-resizing");
		e.setAttribute("data-resizing", ""), i = xN(e), s(t(a())), n || e.removeAttribute("data-resizing");
	}, d = () => {
		u(() => null), r && pN(r), c();
	};
	if (r) {
		let e = dN(r);
		e !== null && s(e);
	}
	o();
	let f = () => UM(getComputedStyle(e).direction === "rtl" ? "rtl" : "ltr"), p = null, m = 0, h = 0, g = !1, _ = (e) => {
		let n = e;
		n.button === 0 && (n.preventDefault(), p = n.pointerId, m = n.clientX, g = !1, t.setPointerCapture(n.pointerId));
	}, v = (n) => {
		let r = n;
		if (!(p === null || r.pointerId !== p)) {
			if (!g) {
				if (!VM(m, r.clientX)) return;
				g = !0, i = xN(e), m = r.clientX, h = a(), e.setAttribute("data-resizing", ""), t.setAttribute("data-dragging", "");
			}
			s(h + (r.clientX - m) * f());
		}
	}, y = (n) => {
		let r = n;
		p === null || r.pointerId !== p || (t.hasPointerCapture(r.pointerId) && t.releasePointerCapture(r.pointerId), p = null, g && (g = !1, e.removeAttribute("data-resizing"), t.removeAttribute("data-dragging"), l()));
	}, b = S(t, {
		pointerdown: _,
		pointermove: v,
		pointerup: y,
		pointercancel: y,
		keydown: (e) => {
			let t = e, n = BM(t);
			switch (n.kind) {
				case "delta":
					u((e) => e + n.delta * f());
					break;
				case "home":
					u(() => 0);
					break;
				case "end":
					u(() => 1e5);
					break;
				case "reset":
					t.preventDefault(), d();
					return;
				case "none": return;
			}
			t.preventDefault(), l();
		},
		dblclick: d
	});
	return () => {
		b(), e.removeAttribute("data-resizing"), t.removeAttribute("data-dragging");
	};
}
var CN, wN, TN, EN, DN, ON = t((() => {
	sN(), JM(), k(), G(), vN(), CN = "[data-sk-sidebar]", wN = "[data-sk-sidebar-trigger]", TN = "[data-sk-sidebar-content]", EN = "[data-sk-sidebar-resize]", DN = Ms({
		key: "sidebar",
		rootSelector: CN,
		connect: (e) => bN(e, {
			defaultCollapsed: e.hasAttribute("data-default-collapsed"),
			storageKey: e.dataset.storageKey
		})
	});
}));
//#endregion
//#region packages/core/src/slider.ts
function kN(e, t, n) {
	return !Number.isFinite(e) || !Number.isFinite(t) || !Number.isFinite(n) || n <= t ? 0 : Math.min(Math.max((e - t) / (n - t), 0), 1);
}
function AN(e, t, n, r) {
	return {
		lowMin: n,
		lowMax: t,
		highMin: e,
		highMax: r
	};
}
function jN(e, t) {
	return e <= t ? {
		low: e,
		high: t
	} : {
		low: t,
		high: e
	};
}
var MN, NN, PN = t((() => {
	MN = {
		root: "sk-slider",
		rangeRoot: "sk-slider-range",
		rangeTrack: "sk-slider-range__track",
		rangeFill: "sk-slider-range__fill",
		rangeLow: "sk-slider-range__low",
		rangeHigh: "sk-slider-range__high"
	}, NN = "--sk-slider-fill";
})), FN = /* @__PURE__ */ n({
	connectSlider: () => IN,
	mountSlider: () => RN
});
function IN(e) {
	if (!(e instanceof HTMLInputElement) || e.type !== "range") throw Error(`Slider enhancer expects an <input type="range"> as its root (${LN}).`);
	if (!e.classList.contains(MN.root)) throw Error(`Slider enhancer expects .${MN.root} on the root element.`);
	let t = () => {
		let t = e.min === "" ? 0 : Number(e.min), n = e.max === "" ? 100 : Number(e.max);
		e.style.setProperty(NN, String(kN(Number(e.value), t, n)));
	};
	return t(), S(e, { input: t });
}
var LN, RN, zN = t((() => {
	PN(), k(), G(), LN = "[data-sk-slider]", RN = Ms({
		key: "slider",
		rootSelector: LN,
		connect: IN
	});
})), BN, VN = t((() => {
	BN = {
		root: "sk-callout",
		icon: "sk-callout__icon",
		content: "sk-callout__content",
		title: "sk-callout__title",
		description: "sk-callout__description",
		actions: "sk-callout__actions"
	};
}));
//#endregion
//#region packages/core/src/content.ts
function HN(e) {
	return e === "danger" ? "assertive" : "polite";
}
function UN(e) {
	return typeof e == "number" && Number.isFinite(e) && e > 0;
}
var WN, GN, KN, qN = t((() => {
	VN(), WN = {
		polite: {
			ariaLive: "polite",
			role: "status"
		},
		assertive: {
			ariaLive: "assertive",
			role: "alert"
		}
	}, GN = { dismiss: "sk-dismiss" }, KN = {
		toastRegion: "sk-toast-region",
		toast: BN.root,
		toastIcon: BN.icon,
		toastContent: BN.content,
		toastTitle: BN.title,
		toastDescription: BN.description,
		toastActions: BN.actions,
		toastDismiss: "sk-toast__dismiss"
	};
})), JN = /* @__PURE__ */ n({
	connectToast: () => YN,
	mountToast: () => nP
});
function YN(e, t = {}) {
	if (!e.classList.contains(KN.toast)) throw Error(`Toast enhancer expects .${KN.toast} on the root element.`);
	let n = e.querySelector(tP);
	if (n && !(n instanceof HTMLButtonElement)) throw Error("Toast dismiss control must be a <button>.");
	let r = WN[HN(XN(e))], i = e.closest(`.${KN.toastRegion}`);
	x(e, {
		"aria-live": r.ariaLive,
		"aria-atomic": "true",
		role: r.role
	}), i && x(i, { "aria-live": "polite" }), n && x(n, { type: "button" });
	let a = !1, o, s = (n) => {
		if (a) return;
		a = !0, o !== void 0 && clearTimeout(o);
		let r = () => {
			let r = { reason: n };
			t.onDismiss?.(r), e.dispatchEvent(new CustomEvent(GN.dismiss, {
				bubbles: !0,
				detail: r
			}));
		};
		x(e, { "data-dismissing": !0 });
		let i = QN(e);
		if (i <= 0) {
			r();
			return;
		}
		$N(e, i).then(r);
	}, c = n ? S(n, { click: () => s("dismiss") }) : () => {};
	return UN(t.timeout) && (o = setTimeout(() => s("timeout"), t.timeout)), () => {
		c(), o !== void 0 && clearTimeout(o);
	};
}
function XN(e) {
	let t = e.dataset.tone;
	return t === "info" || t === "success" || t === "warning" || t === "danger" ? t : "neutral";
}
function ZN(e) {
	let t = Number(e);
	return UN(t) ? t : void 0;
}
function QN(e) {
	return Math.max(0, ...getComputedStyle(e).transitionDuration.split(",").map((e) => parseFloat(e) * 1e3 || 0));
}
function $N(e, t) {
	return new Promise((n) => {
		let r = !1, i = () => {
			r || (r = !0, e.removeEventListener("transitionend", a), n());
		}, a = (t) => {
			t.target === e && i();
		};
		e.addEventListener("transitionend", a), setTimeout(i, t + 50);
	});
}
var eP, tP, nP, rP = t((() => {
	qN(), k(), G(), eP = "[data-sk-toast]", tP = `.${KN.toastDismiss}`, nP = Ms({
		key: "toast",
		rootSelector: eP,
		connect: (e) => YN(e, { timeout: ZN(e.dataset.timeout) })
	});
})), iP, aP = t((() => {
	iP = { openChange: "sk:openchange" };
}));
//#endregion
//#region packages/vanilla/src/components/vaul-gesture.ts
function oP(e, t) {
	return e === "block-end" ? {
		axis: "y",
		sign: 1
	} : {
		axis: "x",
		sign: e === "inline-start" === t ? 1 : -1
	};
}
function sP(e, { travelled: t, size: n, threshold: r, velocity: i }) {
	if (e.length === 0) return !1;
	let a = e[0], o = e[e.length - 1], s = o.at - a.at, c = s > 0 ? (o.at_offset - a.at_offset) / s : 0, l = c > i, u = n > 0 && t / n > r;
	return !(c < -i) && (l || u);
}
var cP, lP = t((() => {
	cP = (e, t) => t * (1 - Math.exp(-e / t));
})), uP = /* @__PURE__ */ n({
	connectVaul: () => dP,
	mountVaul: () => fP
});
function dP(e, t = {}) {
	if (!(e instanceof HTMLDialogElement)) throw Error("Vaul requires a native <dialog>: the modality is the platform's, not ours.");
	let n = t.edge ?? e.dataset.edge ?? "inline-start", r = t.dismissThreshold ?? .4, i = t.dismissVelocity ?? .5, a = t.draggable ?? !0;
	e.dataset.scope = "vaul", e.dataset.part = e.dataset.part || "root", e.dataset.edge || (e.dataset.edge = n);
	let o = () => {
		e.dispatchEvent(new CustomEvent(iP.openChange, {
			detail: { open: e.open },
			bubbles: !0
		})), t.onOpenChange?.({ open: e.open });
	};
	e.addEventListener("close", o);
	let s = e.querySelector("[data-part=\"handle\"].sk-vaul__handle, :scope > [data-part=\"handle\"]");
	if (!a || !s) return () => e.removeEventListener("close", o);
	let c = (t, n) => {
		e.style.setProperty("--sk-vaul-drag-offset", `${t}px`);
		let r = n > 0 ? Math.min(1, Math.max(0, t / n)) : 0;
		e.style.setProperty("--sk-vaul-drag-progress", String(r));
	}, l = () => {
		e.style.removeProperty("--sk-vaul-drag-offset"), e.style.removeProperty("--sk-vaul-drag-progress");
	}, u = () => n === "block-end" ? e.getBoundingClientRect().height : e.getBoundingClientRect().width, d = () => {
		let t = getComputedStyle(e).getPropertyValue("--sk-vaul-overpull").trim(), n = Number.parseFloat(t);
		return Number.isFinite(n) && n > 0 ? n : 12;
	}, f = null, p = 0, m = 0, h = [], g, _ = () => {
		let t = getComputedStyle(e).getPropertyValue("--sk-vaul-release-duration").trim(), n = Number.parseFloat(t);
		return Number.isFinite(n) ? t.endsWith("ms") ? n : n * 1e3 : 320;
	}, v = () => {
		e.dataset.releasing = "", window.clearTimeout(g), g = window.setTimeout(() => delete e.dataset.releasing, _());
	}, y = (e) => e.preventDefault(), b = (t) => {
		if (f !== null || !t.isPrimary || t.buttons === 0) return;
		t.preventDefault();
		let r = getComputedStyle(e).direction === "rtl", { axis: i } = oP(n, r);
		f = t.pointerId, p = i === "x" ? t.clientX : t.clientY, m = 0, h = [{
			at: t.timeStamp,
			at_offset: 0
		}], window.clearTimeout(g), delete e.dataset.releasing, e.dataset.dragging = "", s.setPointerCapture(t.pointerId), window.addEventListener("pointermove", x), window.addEventListener("pointerup", C), window.addEventListener("pointercancel", C), window.addEventListener("dragstart", y);
	}, x = (t) => {
		if (t.pointerId !== f) return;
		if (t.buttons === 0) {
			C(t);
			return;
		}
		let r = getComputedStyle(e).direction === "rtl", { axis: i, sign: a } = oP(n, r), o = ((i === "x" ? t.clientX : t.clientY) - p) * a;
		m = o >= 0 ? o : -cP(-o, d()), c(m, u()), h.push({
			at: t.timeStamp,
			at_offset: m
		});
		let s = t.timeStamp - 100;
		for (; h.length > 2 && h[0].at < s;) h.shift();
	}, S = () => {
		window.removeEventListener("pointermove", x), window.removeEventListener("pointerup", C), window.removeEventListener("pointercancel", C), window.removeEventListener("dragstart", y);
	}, C = (t) => {
		if (t.pointerId !== f) return;
		f = null, S(), delete e.dataset.dragging, s.hasPointerCapture(t.pointerId) && s.releasePointerCapture(t.pointerId);
		let n = sP(h, {
			travelled: m,
			size: u(),
			threshold: r,
			velocity: i
		});
		v(), l(), n && e.close();
	}, w = getComputedStyle(e).getPropertyValue("--breakpoint-desktop").trim() || "52rem", T = window.matchMedia(`(width < ${w})`), E = () => {
		s.removeEventListener("pointerdown", b), T.matches && s.addEventListener("pointerdown", b);
	};
	return E(), T.addEventListener("change", E), () => {
		e.removeEventListener("close", o), T.removeEventListener("change", E), s.removeEventListener("pointerdown", b), S(), window.clearTimeout(g), l(), delete e.dataset.dragging, delete e.dataset.releasing;
	};
}
var fP, pP = t((() => {
	aP(), G(), lP(), fP = Ms({
		key: "vaul",
		rootSelector: "[data-sk-vaul], [data-sk-dialog-vaul]",
		connect: (e) => {
			let t = dP(e, {
				draggable: e.dataset.draggable !== "false",
				dismissThreshold: e.dataset.dismissThreshold ? Number(e.dataset.dismissThreshold) : void 0
			});
			if (!(e instanceof HTMLDialogElement)) return t;
			let n = () => {
				e.showModal();
			}, r = e.matches("[data-sk-dialog-vaul]") ? "data-sk-dialog-vaul" : "data-sk-vaul", i = e.id ? [...document.querySelectorAll(`[${r}-open="${e.id}"]`)] : [];
			for (let e of i) e.addEventListener("click", n);
			let a = () => e.close(), o = [...e.querySelectorAll(`[${r}-close]`)];
			for (let e of o) e.addEventListener("click", a);
			let s = (t) => {
				if (t.target !== e) return;
				let n = e.getBoundingClientRect();
				(t.clientX < n.left || t.clientX > n.right || t.clientY < n.top || t.clientY > n.bottom) && e.close();
			};
			return e.addEventListener("click", s), () => {
				t();
				for (let e of i) e.removeEventListener("click", n);
				for (let e of o) e.removeEventListener("click", a);
				e.removeEventListener("click", s);
			};
		}
	});
}));
//#endregion
//#region packages/vanilla/src/components/Tabs.svelte
function mP(e, t) {
	Ft(t, !0);
	let n = Is(), r = (e) => e.getAttribute("data-value") ?? "", i = (e) => e.hasAttribute("data-disabled") || e.getAttribute("aria-disabled") === "true", a = n.querySelector("[data-sk-tabs-list]"), o = Array.from(n.querySelectorAll("[data-sk-tabs-content]")), s = (a ? Array.from(a.querySelectorAll("[data-sk-tabs-trigger]")) : []).map((e) => {
		let t = r(e);
		if (!t) return null;
		let n = o.find((e) => r(e) === t);
		return n ? {
			value: t,
			trigger: e,
			content: n,
			disabled: i(e)
		} : null;
	}).filter((e) => e !== null);
	n.id ||= Ps("sk-tabs"), a && !a.id && (a.id = Ps("sk-tabs-list"));
	let c = n.getAttribute("data-orientation") === "vertical" ? "vertical" : "horizontal", l = n.getAttribute("data-activation-mode") === "manual" ? "manual" : "automatic", u = s.filter((e) => !e.disabled), d = n.getAttribute("data-value"), f = (d && u.some((e) => e.value === d) ? d : u[0]?.value) ?? null, p = tM(fm, () => ({
		id: n.id,
		ids: {
			root: n.id,
			list: a?.id ?? n.id
		},
		orientation: c,
		activationMode: l,
		defaultValue: f,
		onValueChange(e) {
			n.dispatchEvent(new CustomEvent("sk-value-change", {
				bubbles: !0,
				detail: { value: e.value }
			}));
		}
	})), m = /* @__PURE__ */ R(() => xp(p, Gj));
	Wr(() => {
		T(n, V(m).getRootProps()), n.setAttribute("data-value", V(m).value ?? ""), a && T(a, V(m).getListProps());
		for (let e of s) {
			T(e.trigger, V(m).getTriggerProps({
				value: e.value,
				disabled: e.disabled || void 0
			}));
			let t = V(m).getContentProps({ value: e.value });
			T(e.content, t), typeof t.id == "string" && e.trigger.setAttribute("aria-controls", t.id);
		}
	});
	let h = [];
	bs(() => {
		a && h.push(D(a, () => V(m).getListProps()));
		for (let e of s) h.push(D(e.trigger, () => V(m).getTriggerProps({
			value: e.value,
			disabled: e.disabled || void 0
		})));
	}), xs(() => {
		for (let e of h) e();
	}), It();
}
var hP = t((() => {
	Ts(), vs(), zj(), aM(), Cs(), k(), G();
})), gP = /* @__PURE__ */ n({ mountTabs: () => _P }), _P, vP = t((() => {
	hP(), G(), _P = js({
		key: "tabs",
		rootSelector: "[data-sk-tabs]",
		Component: mP
	});
})), yP, bP, xP, SP = t((() => {
	yP = {
		root: "data-sk-carousel",
		loop: "data-loop",
		autoplay: "data-autoplay",
		orientation: "data-orientation",
		controls: "data-controls",
		mouseDrag: "data-mouse-drag"
	}, bP = {
		root: "sk-carousel",
		track: "sk-carousel__track",
		slide: "sk-carousel__slide",
		controls: "sk-carousel__controls",
		button: "sk-carousel__button",
		autoplay: "sk-carousel__autoplay",
		dots: "sk-carousel__dots",
		dot: "sk-carousel__dot"
	}, xP = {
		change: "sk-carousel-change",
		goto: "sk-carousel-goto"
	};
}));
//#endregion
//#region packages/vanilla/src/components/Carousel.svelte
function CP(e, t) {
	Ft(t, !0);
	let n = Is(), r = n.querySelector(`.${bP.track}`);
	if (!r) throw Error(`[data-sk-carousel] necesita una pista .${bP.track}.`);
	let i = Array.from(r.querySelectorAll(`.${bP.slide}`));
	n.id ||= Ps("sk-carousel");
	let a = {
		root: n.id,
		itemGroup: `${n.id}-track`,
		item: (e) => `${n.id}-slide-${e}`,
		prevTrigger: `${n.id}-prev`,
		nextTrigger: `${n.id}-next`,
		indicatorGroup: `${n.id}-dots`,
		indicator: (e) => `${n.id}-dot-${e}`
	};
	r.id = a.itemGroup, r.setAttribute("data-scope", "carousel"), r.setAttribute("data-part", "itemGroup"), i.forEach((e, t) => {
		e.id = a.item(t), e.setAttribute("data-scope", "carousel"), e.setAttribute("data-part", "item"), e.setAttribute("data-index", String(t)), e.style.setProperty("scroll-snap-align", "start");
	});
	let o = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? !1, c = n.getAttribute("data-autoplay"), l = Number(c), u = c !== null, d = !u || o ? !1 : Number.isFinite(l) && l > 0 ? { delay: l } : !0, f = tM(Xm, () => ({
		id: n.id,
		ids: a,
		slideCount: i.length,
		orientation: n.getAttribute("data-orientation") === "vertical" ? "vertical" : "horizontal",
		dir: n.closest("[dir=rtl]") ? "rtl" : "ltr",
		loop: n.hasAttribute("data-loop"),
		autoplay: d,
		allowMouseDrag: n.getAttribute("data-mouse-drag") !== "off",
		autoSize: !0,
		spacing: "var(--sk-carousel-gap)",
		translations: {
			nextTrigger: "Siguiente",
			prevTrigger: "Anterior",
			indicator: (e) => `Ir a la diapositiva ${e + 1}`,
			item: (e, t) => `${e + 1} de ${t}`,
			autoplayStart: "Reanudar la rotación",
			autoplayStop: "Pausar la rotación"
		}
	})), p = /* @__PURE__ */ R(() => Fm(f, Gj)), m = /* @__PURE__ */ or(!1), h = /* @__PURE__ */ or(!1), g = /* @__PURE__ */ or(_r(!!d));
	Wr(() => {
		if (!u) return;
		let e = V(g) && !V(m) && !V(h);
		e !== V(p).isPlaying && (e ? V(p).play() : V(p).pause());
	});
	let _ = n.getAttribute("data-controls") !== "none", v = /* @__PURE__ */ R(() => _ && i.length > 1 && V(p).pageSnapPoints.length > 1), y = !1;
	Wr(() => {
		let e = !y;
		T(n, V(p).getRootProps(), { style: e }), T(r, V(p).getItemGroupProps(), { style: e }), i.forEach((t, n) => {
			T(t, V(p).getItemProps({ index: n }), { style: e });
		}), y = !0;
	});
	let b = -1;
	Wr(() => {
		let e = V(p).page, t = V(p).pageSnapPoints.length;
		if (e === b) return;
		let r = b === -1;
		b = e, !r && n.dispatchEvent(new CustomEvent(xP.change, {
			bubbles: !0,
			detail: {
				index: e,
				count: t
			}
		}));
	});
	let x = [];
	bs(() => {
		x.push(D(r, () => V(p).getItemGroupProps()));
		let e = (e) => {
			let t = e.detail?.index ?? 0;
			t === V(p).page ? V(p).refresh() : V(p).scrollTo(t);
		};
		if (n.addEventListener(xP.goto, e), x.push(() => n.removeEventListener(xP.goto, e)), u) {
			let e = () => {
				cr(m, !0);
			}, t = () => {
				cr(m, !1);
			}, r = () => {
				cr(h, !0);
			}, i = (e) => {
				n.contains(e.relatedTarget) || cr(h, !1);
			};
			n.addEventListener("mouseenter", e), n.addEventListener("mouseleave", t), n.addEventListener("focusin", r), n.addEventListener("focusout", i), x.push(() => {
				n.removeEventListener("mouseenter", e), n.removeEventListener("mouseleave", t), n.removeEventListener("focusin", r), n.removeEventListener("focusout", i);
			});
		}
		s(n), V(p).refresh();
	}), xs(() => {
		for (let e of x) e();
	});
	var S = _a(), C = Dr(S), w = (e) => {
		var t = TP();
		Io(t, (e) => ({
			class: bP.controls,
			...e
		}), [() => V(p).getControlProps()]);
		var n = Er(t);
		Io(n, (e) => ({
			...e,
			class: `${bP.button ?? ""} sk-interactive`
		}), [() => V(p).getPrevTriggerProps()]);
		var r = Or(n, 2);
		Io(r, (e) => ({
			class: bP.dots,
			...e
		}), [() => V(p).getIndicatorGroupProps()]), Wa(r, 21, () => V(p).pageSnapPoints, Va, (e, t, n) => {
			var r = wP();
			Io(r, (e) => ({
				...e,
				class: `${bP.dot ?? ""} sk-interactive`,
				"aria-current": n === V(p).page ? "true" : void 0
			}), [() => V(p).getIndicatorProps({ index: n })]), va(e, r);
		}), P(r);
		var i = Or(r, 2);
		Io(i, (e) => ({
			...e,
			class: `${bP.button ?? ""} sk-interactive`
		}), [() => V(p).getNextTriggerProps()]);
		var a = Or(i, 2), o = (e) => {
			var t = wP(), n = (e) => {
				e.defaultPrevented || cr(g, !V(g));
			};
			Io(t, (e) => ({
				...e,
				class: `${bP.button ?? ""} ${bP.autoplay ?? ""} sk-interactive`,
				"data-pressed": V(g) ? "" : void 0,
				"aria-label": V(g) ? "Pausar la rotación" : "Reanudar la rotación",
				onclick: n
			}), [() => V(p).getAutoplayTriggerProps()]), va(e, t);
		};
		La(a, (e) => {
			u && e(o);
		}), P(t), va(e, t);
	};
	La(C, (e) => {
		V(v) && e(w);
	}), va(e, S), It();
}
var wP, TP, EP = t((() => {
	Ts(), vs(), zj(), SP(), aM(), Cs(), k(), G(), _(), wP = /* @__PURE__ */ ga("<button></button>"), TP = /* @__PURE__ */ ga("<div><button><span data-sk-icon=\"chevron-left\" data-sk-icon-size=\"sm\"></span></button> <div></div> <button><span data-sk-icon=\"chevron-right\" data-sk-icon-size=\"sm\"></span></button> <!></div>");
})), DP = /* @__PURE__ */ n({ mountCarousel: () => OP }), OP, kP = t((() => {
	SP(), EP(), G(), OP = js({
		key: "carousel",
		rootSelector: `[${yP.root}]`,
		Component: CP
	});
})), AP, jP, MP, NP, PP = t((() => {
	AP = {
		root: "root",
		item: "item",
		trigger: "trigger",
		triggerHeading: "trigger-heading",
		content: "content"
	}, jP = "accordion", MP = {
		root: "sk-accordion",
		triggerHeading: "sk-accordion__trigger-heading"
	}, NP = { valueChange: "sk:accordionvaluechange" }, { ...MP }, AP.triggerHeading;
})), FP, IP, LP = t((() => {
	FP = {
		root: "sk-tile",
		interactive: "sk-tile--interactive",
		expandable: "sk-tile--expandable",
		content: "sk-tile__content",
		title: "sk-tile__title",
		description: "sk-tile__description",
		selectionIndicator: "sk-tile__selection-indicator",
		trigger: "sk-tile__trigger",
		chevron: "sk-tile__chevron",
		expandableContent: "sk-tile__expandable-content",
		grid: "sk-tile-grid"
	}, IP = {
		checkedChange: "sk:checkedchange",
		valueChange: "sk:valuechange",
		openChange: "sk:openchange"
	};
}));
//#endregion
//#region packages/vanilla/src/components/AccordionItem.svelte
function RP(e, t) {
	Ft(t, !0);
	let n = fs(t, "el", 7), r = tM(uh, () => ({
		id: t.id,
		open: t.open,
		disabled: t.disabled,
		onOpenChange(e) {
			e.open !== t.open && t.onToggle(t.value);
		}
	})), i = /* @__PURE__ */ R(() => ch(r, Gj)), a = (e, t) => {
		e.setAttribute("data-scope", "tile"), e.setAttribute("data-part", t);
	};
	Wr(() => {
		T(n(), V(i).getRootProps()), a(n(), "item"), E(n(), FP.root, FP.expandable), n().dataset.value = t.value, t.trigger && (T(t.trigger, V(i).getTriggerProps()), a(t.trigger, "trigger"), E(t.trigger, FP.interactive, "sk-interactive")), t.content && (T(t.content, V(i).getContentProps()), a(t.content, "content"));
	});
	let o = [];
	bs(() => {
		t.trigger && o.push(D(t.trigger, () => V(i).getTriggerProps()));
	}), xs(() => {
		for (let e of o) e();
	}), It();
}
var zP = t((() => {
	Ts(), vs(), LP(), zj(), aM(), Cs(), k();
}));
//#endregion
//#region packages/vanilla/src/components/Accordion.svelte
function BP(e, t) {
	Ft(t, !0);
	let n = Is(), r = Array.from(n.querySelectorAll(":scope > [data-part=\"item\"]"));
	r.forEach((e, t) => {
		e.dataset.value || (e.dataset.value = e.id || `item-${t + 1}`);
	}), E(n, MP.root), n.setAttribute("data-part", AP.root), n.setAttribute("data-scope", jP);
	let i = n.dataset.type === "multiple", a = n.dataset.collapsible !== "false", o = n.hasAttribute("data-disabled"), s = n.dataset.defaultValue, c = s ? i ? s.split(",") : [s] : r.filter((e) => e.hasAttribute("data-default-open")).map((e) => e.dataset.value ?? ""), l = r.map((e) => (e.id ||= Ps("sk-accordion-item"), {
		id: e.id,
		value: e.dataset.value ?? "",
		el: e,
		trigger: e.querySelector("[data-part=\"trigger\"]"),
		content: e.querySelector(":scope > [data-part=\"content\"]"),
		disabled: o || e.hasAttribute("data-disabled")
	})), u = /* @__PURE__ */ or(_r([...new Set(i ? c : c.slice(0, 1))].filter(Boolean)));
	function d(e) {
		let t = V(u).includes(e), r;
		r = t ? i || a ? V(u).filter((t) => t !== e) : V(u) : i ? [...V(u), e] : [e], cr(u, r, !0);
		let o = { value: i ? r : r[0] ?? null };
		n.dispatchEvent(new CustomEvent(NP.valueChange, {
			bubbles: !0,
			detail: o
		}));
	}
	var f = _a();
	Wa(Dr(f), 17, () => l, (e) => e.value, (e, t) => {
		{
			let n = /* @__PURE__ */ R(() => V(u).includes(V(t).value));
			RP(e, {
				get id() {
					return V(t).id;
				},
				get value() {
					return V(t).value;
				},
				get el() {
					return V(t).el;
				},
				get trigger() {
					return V(t).trigger;
				},
				get content() {
					return V(t).content;
				},
				get disabled() {
					return V(t).disabled;
				},
				get open() {
					return V(n);
				},
				onToggle: d
			});
		}
	}), va(e, f), It();
}
var VP = t((() => {
	Ts(), vs(), PP(), k(), G(), zP();
})), HP = /* @__PURE__ */ n({ mountAccordion: () => UP }), UP, WP = t((() => {
	VP(), G(), UP = js({
		key: "accordion",
		rootSelector: "[data-sk-accordion]",
		Component: BP
	});
}));
//#endregion
//#region packages/vanilla/src/components/ExpandableTile.svelte
function GP(e, t) {
	Ft(t, !0);
	let n = Is(), r = n.querySelector("[data-part=\"trigger\"]"), i = n.querySelector(":scope > [data-part=\"content\"], :scope > [data-part=\"expandable-content\"]");
	if (!r || !i) throw Error("ExpandableTile requires trigger and content parts.");
	n.id ||= Ps("sk-tile");
	let a = n.hasAttribute("data-disabled"), o = n.hasAttribute("data-default-open") || n.hasAttribute("data-open"), s = tM(uh, () => ({
		id: n.id,
		disabled: a,
		defaultOpen: o,
		onOpenChange(e) {
			n.dispatchEvent(new CustomEvent(IP.openChange, {
				bubbles: !0,
				detail: { open: e.open }
			}));
		}
	})), c = /* @__PURE__ */ R(() => ch(s, Gj)), l = (e) => e.setAttribute("data-scope", "tile");
	Wr(() => {
		T(n, V(c).getRootProps()), T(r, V(c).getTriggerProps()), T(i, V(c).getContentProps()), l(n), l(r), l(i), E(n, FP.root, FP.expandable), E(r, FP.interactive, "sk-interactive");
	});
	let u = [];
	bs(() => {
		u.push(D(r, () => V(c).getTriggerProps()));
	}), xs(() => {
		for (let e of u) e();
	}), It();
}
var KP = t((() => {
	Ts(), vs(), zj(), LP(), aM(), Cs(), k(), G();
})), qP = /* @__PURE__ */ n({ mountExpandableTile: () => JP }), JP, YP = t((() => {
	KP(), G(), JP = js({
		key: "expandable-tile",
		rootSelector: "[data-sk-expandable-tile]",
		Component: GP
	});
})), XP, ZP, QP = t((() => {
	XP = { valueChange: "sk:checkboxgroupvaluechange" }, ZP = {
		checkbox: "sk-checkbox",
		checkboxInput: "sk-checkbox__input",
		checkboxControl: "sk-checkbox__control",
		checkboxIndicator: "sk-checkbox__indicator",
		checkboxLabel: "sk-checkbox__label",
		radioGroup: "sk-radio-group",
		radio: "sk-radio",
		radioInput: "sk-radio__input",
		radioControl: "sk-radio__control",
		radioIndicator: "sk-radio__indicator",
		radioLabel: "sk-radio__label",
		switch: "sk-switch",
		switchInput: "sk-switch__input",
		switchControl: "sk-switch__control",
		switchThumb: "sk-switch__thumb",
		switchLabel: "sk-switch__label"
	}, { ...ZP };
})), $P = /* @__PURE__ */ n({ mountCheckboxGroup: () => sF });
function eF(e) {
	return Array.from(e.querySelectorAll(aF)).filter((t) => t.closest("[data-sk-checkbox-group]") === e);
}
function tF(e) {
	let t = e.filter((e) => !e.disabled);
	return t.length === 0 ? !1 : t.every((e) => e.checked) ? !0 : t.some((e) => e.checked) ? "indeterminate" : !1;
}
function nF(e) {
	return e.map((e) => (e.id ||= `sk-checkbox-group-item-${++oF}`, e.id));
}
function rF(e) {
	let t = e.querySelector(iF);
	if (!t) return () => {};
	t.setAttribute("aria-controls", nF(eF(e)).join(" "));
	let n = () => {
		let n = tF(eF(e));
		return t.checked = n === !0, t.indeterminate = n === "indeterminate", n;
	}, r = (t) => {
		e.dispatchEvent(new CustomEvent(XP.valueChange, {
			bubbles: !0,
			detail: {
				checked: t,
				value: eF(e).filter((e) => e.checked).map((e) => e.value)
			}
		}));
	}, i = (i) => {
		let a = i.target;
		if (a instanceof HTMLInputElement) {
			if (a === t) {
				let n = t.checked;
				for (let t of eF(e)) t.disabled || (t.checked = n);
				t.indeterminate = !1, r(n);
				return;
			}
			eF(e).includes(a) && r(n());
		}
	}, a = () => {
		queueMicrotask(n);
	};
	return e.addEventListener("change", i), e.ownerDocument.addEventListener("reset", a), n(), () => {
		e.removeEventListener("change", i), e.ownerDocument.removeEventListener("reset", a);
	};
}
var iF, aF, oF, sF, cF = t((() => {
	QP(), G(), iF = "[data-sk-checkbox-group-all]", aF = "[data-sk-checkbox-group-item]", oF = 0, sF = Ms({
		key: "checkbox-group",
		rootSelector: "[data-sk-checkbox-group]",
		connect: rF
	});
}));
//#endregion
//#region packages/vanilla/src/components/TileCheckbox.svelte
function lF(e, t) {
	Ft(t, !0);
	let n = Is(), r = n.querySelector("input[type=\"checkbox\"][data-part=\"input\"], input[type=\"checkbox\"]");
	if (!r) throw Error("TileCheckbox requires an input[type=checkbox] part.");
	n.id ||= Ps("sk-tile-checkbox");
	let i = n.getAttribute("data-default-checked"), a = i === "true" ? !0 : i === "indeterminate" ? "indeterminate" : i !== "false" && void 0, o = tM(Zh, () => ({
		id: n.id,
		name: n.dataset.name,
		value: n.dataset.value,
		disabled: n.hasAttribute("data-disabled"),
		required: n.hasAttribute("data-required"),
		defaultChecked: a,
		onCheckedChange(e) {
			n.dispatchEvent(new CustomEvent(IP.checkedChange, {
				bubbles: !0,
				detail: { checked: e.checked }
			}));
		}
	})), s = /* @__PURE__ */ R(() => Kh(o, Gj)), c = (e) => e.setAttribute("data-scope", "tile");
	Wr(() => {
		T(n, V(s).getRootProps()), T(r, V(s).getHiddenInputProps()), r.checked = V(s).checked, r.indeterminate = V(s).indeterminate, c(n), r.setAttribute("data-part", "input"), E(n, "sk-interactive");
	});
	let l = [];
	bs(() => {
		l.push(D(n, () => V(s).getRootProps())), l.push(D(r, () => V(s).getHiddenInputProps()));
	}), xs(() => {
		for (let e of l) e();
	}), It();
}
var uF = t((() => {
	Ts(), vs(), zj(), LP(), aM(), Cs(), k(), G();
})), dF = /* @__PURE__ */ n({ mountTileCheckbox: () => fF }), fF, pF = t((() => {
	uF(), G(), fF = js({
		key: "tile-checkbox",
		rootSelector: "[data-sk-tile-checkbox]",
		Component: lF
	});
}));
//#endregion
//#region packages/vanilla/src/components/TileSwitch.svelte
function mF(e, t) {
	Ft(t, !0);
	let n = Is(), r = n.querySelector("input[type=\"checkbox\"][data-part=\"input\"], input[type=\"checkbox\"]");
	if (!r) throw Error("TileSwitch requires an input[type=checkbox] part.");
	n.id ||= Ps("sk-tile-switch");
	let i = n.getAttribute("data-default-checked"), a = i === "true" || i !== "false" && void 0, o = tM(Zh, () => ({
		id: n.id,
		name: n.dataset.name,
		value: n.dataset.value,
		disabled: n.hasAttribute("data-disabled"),
		required: n.hasAttribute("data-required"),
		defaultChecked: a,
		onCheckedChange(e) {
			n.dispatchEvent(new CustomEvent(IP.checkedChange, {
				bubbles: !0,
				detail: { checked: e.checked === !0 }
			}));
		}
	})), s = /* @__PURE__ */ R(() => Kh(o, Gj)), c = (e) => e.setAttribute("data-scope", "tile");
	Wr(() => {
		T(n, V(s).getRootProps()), T(r, V(s).getHiddenInputProps()), r.checked = V(s).checked === !0, c(n), r.setAttribute("data-part", "input"), r.setAttribute("role", "switch"), E(n, "sk-interactive");
	});
	let l = [];
	bs(() => {
		l.push(D(n, () => V(s).getRootProps())), l.push(D(r, () => V(s).getHiddenInputProps()));
	}), xs(() => {
		for (let e of l) e();
	}), It();
}
var hF = t((() => {
	Ts(), vs(), zj(), LP(), aM(), Cs(), k(), G();
})), gF = /* @__PURE__ */ n({ mountTileSwitch: () => _F }), _F, vF = t((() => {
	hF(), G(), _F = js({
		key: "tile-switch",
		rootSelector: "[data-sk-tile-switch]",
		Component: mF
	});
}));
//#endregion
//#region packages/vanilla/src/components/TileRadioGroup.svelte
function yF(e, t) {
	Ft(t, !0);
	let n = Is(), r = Array.from(n.querySelectorAll("[data-part=\"item\"]")).map((e) => {
		let t = e.querySelector("input[type=\"radio\"]");
		return t ? {
			value: t.value,
			label: e,
			input: t,
			text: e.querySelector("[data-part=\"content\"]"),
			control: e.querySelector("[data-part=\"indicator\"]")
		} : null;
	}).filter((e) => e !== null);
	n.id ||= Ps("sk-tile-radio");
	let i = n.getAttribute("data-orientation") === "horizontal" ? "horizontal" : "vertical", a = n.getAttribute("data-default-value"), o = tM(wg, () => ({
		id: n.id,
		name: n.dataset.name || "tile-radio",
		orientation: i,
		disabled: n.hasAttribute("data-disabled"),
		required: n.hasAttribute("data-required"),
		defaultValue: a ?? void 0,
		onValueChange(e) {
			n.dispatchEvent(new CustomEvent(IP.valueChange, {
				bubbles: !0,
				detail: { value: e.value }
			}));
		}
	})), s = /* @__PURE__ */ R(() => bg(o, Gj)), c = (e) => e.setAttribute("data-scope", "tile");
	Wr(() => {
		T(n, V(s).getRootProps()), c(n);
		for (let e of r) {
			let t = { value: e.value };
			T(e.label, V(s).getItemProps(t)), T(e.input, V(s).getItemHiddenInputProps(t)), e.input.checked = V(s).value === e.value, e.text && (T(e.text, V(s).getItemTextProps(t)), e.text.setAttribute("data-part", "content")), e.control && (T(e.control, V(s).getItemControlProps(t)), e.control.setAttribute("data-part", "indicator")), c(e.label), e.label.setAttribute("data-part", "item"), e.input.setAttribute("data-part", "input"), E(e.label, "sk-interactive");
		}
	});
	let l = [];
	bs(() => {
		for (let e of r) {
			let t = { value: e.value };
			l.push(D(e.input, () => V(s).getItemHiddenInputProps(t))), l.push(D(e.label, () => V(s).getItemProps(t)));
		}
	}), xs(() => {
		for (let e of l) e();
	}), It();
}
var bF = t((() => {
	Ts(), vs(), zj(), LP(), aM(), Cs(), k(), G();
})), xF = /* @__PURE__ */ n({ mountTileRadioGroup: () => SF }), SF, CF = t((() => {
	bF(), G(), SF = js({
		key: "tile-radio-group",
		rootSelector: "[data-sk-tile-radio-group]",
		Component: yF
	});
}));
//#endregion
//#region packages/core/src/pagination.ts
function wF(e, t, n = 1) {
	if (!Number.isFinite(t) || t <= 1) return [];
	let r = Math.min(Math.max(Math.trunc(e), 1), t), i = Math.max(r - n, 1), a = Math.min(r + n, t), o = [1];
	for (let e = i; e <= a; e++) e !== 1 && e !== t && o.push(e);
	t > 1 && o.push(t);
	let s = [], c = 0;
	for (let e of o) e - c > 1 && s.push("ellipsis"), s.push(e), c = e;
	return s;
}
var TF, EF, DF = t((() => {
	TF = {
		root: "sk-pagination",
		item: "sk-pagination__item",
		previous: "sk-pagination__previous",
		next: "sk-pagination__next",
		ellipsis: "sk-pagination__ellipsis"
	}, EF = {
		root: "data-sk-table-pager",
		row: "data-sk-table-pager-row",
		nav: "data-sk-table-pager-nav",
		status: "data-sk-table-pager-status"
	}, TF.root, EF.root, EF.status, EF.nav;
})), OF = /* @__PURE__ */ n({
	connectTablePager: () => AF,
	mountTablePager: () => RF
});
function kF(e, t, n) {
	let r = null;
	for (let i of n) {
		let n = t.get(i.key) ?? i.build();
		i.update(n), (r ? r.nextElementSibling !== n : e.firstElementChild !== n) && e.insertBefore(n, r ? r.nextSibling : e.firstChild), t.set(i.key, n), r = n;
	}
	let i = new Set(n.map((e) => e.key));
	for (let [e, n] of t) i.has(e) || (n.remove(), t.delete(e));
}
function AF(e) {
	let t = e.querySelector(PF);
	if (!t) throw Error(`[${EF.root}] needs a [${EF.nav}] (.sk-pagination).`);
	let n = e.querySelector(FF), r = e.querySelector("[data-sk-select]"), i = e.getAttribute("data-previous-label") || "Previous page", a = e.getAttribute("data-next-label") || "Next page", o = e.getAttribute("data-page-label") || "Page", c = e.getAttribute("data-status-template") || "{start}–{end} of {total}", l = Math.max(0, Number(e.getAttribute("data-siblings") ?? "1") || 1), u = Math.max(1, Number(e.getAttribute("data-page") ?? "1") || 1), d = jF(e, r), f = /* @__PURE__ */ new Map(), p = () => {
		let r = [...e.querySelectorAll(NF)], h = r.length, g = Math.max(1, Math.ceil(h / d) || 1);
		u = Math.min(Math.max(u, 1), g);
		let _ = (u - 1) * d, v = Math.min(_ + d, h);
		r.forEach((e, t) => {
			e.hidden = t < _ || t >= v;
		}), e.setAttribute("data-page", String(u)), e.setAttribute("data-page-size", String(d)), n && (n.textContent = c.replaceAll("{start}", String(h === 0 ? 0 : _ + 1)).replaceAll("{end}", String(v)).replaceAll("{total}", String(h)));
		let y = wF(u, g, l), b = [{
			key: "previous",
			build: () => {
				let e = document.createElement("button");
				return e.type = "button", e.className = `${TF.previous} sk-interactive`, e.innerHTML = IF, e.addEventListener("click", () => {
					--u, p(), m();
				}), e;
			},
			update: (e) => {
				e.setAttribute("aria-label", i), e.disabled = u <= 1;
			}
		}];
		for (let [e, t] of y.entries()) {
			if (t === "ellipsis") {
				b.push({
					key: `ellipsis:${e}`,
					build: () => {
						let e = document.createElement("span");
						return e.className = TF.ellipsis, e.setAttribute("aria-hidden", "true"), e.textContent = "…", e;
					},
					update: () => {}
				});
				continue;
			}
			b.push({
				key: `page:${t}`,
				build: () => {
					let e = document.createElement("button");
					return e.type = "button", e.className = `${TF.item} sk-interactive`, e.textContent = String(t), e.addEventListener("click", () => {
						u = t, p(), m();
					}), e;
				},
				update: (e) => {
					e.setAttribute("aria-label", `${o} ${t}`), t === u ? e.setAttribute("aria-current", "page") : e.removeAttribute("aria-current");
				}
			});
		}
		b.push({
			key: "next",
			build: () => {
				let e = document.createElement("button");
				return e.type = "button", e.className = `${TF.next} sk-interactive`, e.innerHTML = LF, e.addEventListener("click", () => {
					u += 1, p(), m();
				}), e;
			},
			update: (e) => {
				e.setAttribute("aria-label", a), e.disabled = u >= g;
			}
		}), kF(t, f, b), s(t);
	}, m = () => {
		let t = e.querySelectorAll(NF).length, n = Math.max(1, Math.ceil(t / d) || 1), r = (u - 1) * d, i = Math.min(r + d, t), a = {
			page: u,
			pageSize: d,
			pageCount: n,
			total: t,
			start: t === 0 ? 0 : r + 1,
			end: i
		};
		e.dispatchEvent(new CustomEvent("sk-table-pager-change", {
			bubbles: !0,
			detail: a
		}));
	}, h = ((e) => {
		let t = Number(e.detail.value[0]);
		!Number.isFinite(t) || t <= 0 || (d = t, u = 1, p(), m());
	});
	r?.addEventListener("sk-value-change", h);
	let g = [() => r?.removeEventListener("sk-value-change", h)];
	return p(), () => {
		for (let e of g) e();
	};
}
function jF(e, t) {
	let n = Number(t?.dataset.value);
	if (Number.isFinite(n) && n > 0) return n;
	let r = Number(e.getAttribute("data-page-size") ?? "10");
	return Number.isFinite(r) && r > 0 ? r : 10;
}
var MF, NF, PF, FF, IF, LF, RF, zF = t((() => {
	DF(), _(), G(), MF = `[${EF.root}]`, NF = `[${EF.row}]`, PF = `[${EF.nav}]`, FF = `[${EF.status}]`, IF = "<span data-sk-icon=\"chevron-left\" data-sk-icon-size=\"sm\"></span>", LF = "<span data-sk-icon=\"chevron-right\" data-sk-icon-size=\"sm\"></span>", RF = Ms({
		key: "table-pager",
		rootSelector: MF,
		connect: AF
	});
}));
//#endregion
//#region packages/core/src/command-palette.ts
function BF(e) {
	return e.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function VF(e, t) {
	let n = [e.label, ...e.aliases ?? []].map(BF), r = BF(e.context ?? `${e.section ?? ""} ${e.group ?? ""}`);
	return n.some((e) => e.startsWith(t)) ? 0 : n.some((e) => e.includes(t)) ? 1 : r.includes(t) ? 2 : null;
}
function HF(e, t) {
	let n = BF(t);
	return n === "" ? [...e] : e.map((e) => ({
		entry: e,
		rank: VF(e, n)
	})).filter((e) => e.rank !== null).sort((e, t) => e.rank - t.rank).map((e) => e.entry);
}
function UF(e) {
	return e.context ? e.context : e.section && e.group ? `${e.section} › ${e.group}` : e.section ?? e.group ?? "";
}
var WF, GF, KF = t((() => {
	WF = {
		root: "sk-command-palette",
		search: "sk-command-palette__search",
		input: "sk-command-palette__input",
		close: "sk-command-palette__close",
		list: "sk-command-palette__list",
		option: "sk-command-palette__option",
		optionLabel: "sk-command-palette__option-label",
		optionContext: "sk-command-palette__option-context",
		empty: "sk-command-palette__empty",
		footer: "sk-command-palette__footer"
	}, GF = {
		root: "data-sk-command-palette",
		open: "data-sk-command-palette-open",
		input: "data-sk-command-palette-input",
		list: "data-sk-command-palette-list",
		empty: "data-sk-command-palette-empty",
		index: "data-sk-command-palette-index",
		hotkey: "data-sk-command-palette-hotkey",
		hint: "data-sk-command-palette-hint"
	}, GF.root, GF.index, GF.input, GF.list, GF.empty;
}));
//#endregion
//#region packages/core/src/hotkey.ts
function qF(e) {
	let t = {
		mod: !1,
		meta: !1,
		ctrl: !1,
		shift: !1,
		alt: !1,
		key: ""
	};
	for (let n of e.split("+")) {
		let e = n.trim().toLowerCase();
		if (e === "") continue;
		let r = QF[e];
		r ? t[r] = !0 : t.key = $F[e] ?? e;
	}
	return t;
}
function JF(e, t, n) {
	let r = typeof t == "string" ? qF(t) : t;
	if (r.key === "") return !1;
	let i = e.metaKey ?? !1, a = e.ctrlKey ?? !1, o = r.meta || r.mod && n, s = r.ctrl || r.mod && !n;
	return i !== o || a !== s || (e.shiftKey ?? !1) !== r.shift || (e.altKey ?? !1) !== r.alt ? !1 : e.key.toLowerCase() === r.key;
}
function YF() {
	if (typeof navigator > "u") return !1;
	let e = navigator.userAgentData?.platform ?? navigator.platform ?? "";
	return /mac|iphone|ipad|ipod/i.test(e);
}
function XF(e) {
	if (typeof HTMLElement > "u" || !(e instanceof HTMLElement)) return !1;
	if (e.isContentEditable) return !0;
	let t = e.tagName;
	return t === "INPUT" || t === "TEXTAREA" || t === "SELECT";
}
function ZF(e, t) {
	let n = typeof e == "string" ? qF(e) : e, r = [];
	(n.ctrl || n.mod && !t) && r.push(t ? "⌃" : "Ctrl"), n.alt && r.push(t ? "⌥" : "Alt"), n.shift && r.push(t ? "⇧" : "Shift"), (n.meta || n.mod && t) && r.push(t ? "⌘" : "Win");
	let i = eI[n.key] ?? (n.key.length === 1 ? n.key.toUpperCase() : n.key);
	return r.push(i), t ? r.join("") : r.join("+");
}
var QF, $F, eI, tI = t((() => {
	QF = {
		mod: "mod",
		meta: "meta",
		cmd: "meta",
		command: "meta",
		ctrl: "ctrl",
		control: "ctrl",
		shift: "shift",
		alt: "alt",
		option: "alt",
		opt: "alt"
	}, $F = {
		esc: "escape",
		space: " ",
		spacebar: " ",
		return: "enter"
	}, eI = {
		escape: "Esc",
		enter: "Enter",
		arrowup: "↑",
		arrowdown: "↓",
		arrowleft: "←",
		arrowright: "→",
		" ": "Space"
	};
}));
//#endregion
//#region packages/vanilla/src/hotkey.ts
function nI(e, t, n = {}) {
	let r = n.target ?? (typeof window < "u" ? window : void 0);
	if (!r) return () => {};
	let i = n.mac ?? YF(), a = n.preventDefault ?? !0, o = n.enableWhileTyping ?? !1, s = qF(e), c = s.mod || s.meta || s.ctrl || s.alt, l = (e) => {
		e instanceof KeyboardEvent && (!o && !c && XF(e.target) || JF(e, s, i) && (a && e.preventDefault(), t(e)));
	};
	return r.addEventListener("keydown", l), () => r.removeEventListener("keydown", l);
}
var rI = t((() => {
	tI();
})), iI = /* @__PURE__ */ n({
	connectCommandPalette: () => sI,
	mountCommandPalette: () => dI
});
function aI(e) {
	let t = e.getAttribute(GF.index);
	if (!t) return [];
	let n = document.getElementById(t);
	if (!n) return [];
	try {
		let e = JSON.parse(n.textContent || "[]");
		return Array.isArray(e) ? e : [];
	} catch {
		return [];
	}
}
function oI(e) {
	return e.replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("<", "&lt;");
}
function sI(e) {
	if (!(e instanceof HTMLDialogElement)) throw Error(`CommandPalette root [${GF.root}] must be a <dialog>.`);
	let t = e.querySelector(`[${GF.input}]`), n = e.querySelector(`[${GF.list}]`), r = e.querySelector(`[${GF.empty}]`);
	if (!t || !n) throw Error("CommandPalette requires authored input and list parts.");
	let i = aI(e), a = e.id, o = a ? [...document.querySelectorAll(`${lI}[aria-controls="${CSS.escape(a)}"]`), ...document.querySelectorAll(`[${GF.open}="${CSS.escape(a)}"]`)] : [...document.querySelectorAll(lI)], s = [...new Set(o)], c = e.getAttribute(GF.hotkey);
	if (c) {
		let e = YF();
		document.querySelectorAll(uI).forEach((t) => {
			t.textContent?.trim() !== "Esc" && (t.textContent = ZF(c, e));
		});
	}
	let l = [], u = -1, d = (t) => `${e.id || "sk-command-palette"}-option-${t}`, f = (e) => {
		t.setAttribute("aria-expanded", e ? "true" : "false");
		for (let t of s) t.setAttribute("aria-expanded", e ? "true" : "false");
	}, p = (e) => {
		let r = n.querySelectorAll(`.${WF.option}`);
		u >= 0 && r[u] && r[u].setAttribute("aria-selected", "false"), u = e, u >= 0 && r[u] ? (r[u].setAttribute("aria-selected", "true"), t.setAttribute("aria-activedescendant", d(u)), r[u].scrollIntoView({ block: "nearest" })) : t.removeAttribute("aria-activedescendant");
	}, m = (e) => {
		l = HF(i, e), n.innerHTML = l.map((e, t) => {
			let n = UF(e);
			return `<li class="${WF.option}" id="${d(t)}" role="option" aria-selected="false" data-href="${oI(e.href)}"><span class="${WF.optionLabel}">${oI(e.label)}</span>` + (n ? `<span class="${WF.optionContext}">${oI(n)}</span>` : "") + "</li>";
		}).join(""), r?.toggleAttribute("hidden", l.length !== 0), p(l.length ? 0 : -1);
	}, h = (e) => {
		let t = l[e]?.href;
		t && window.location.assign(t);
	}, g = () => {
		e.open || (t.value = "", m(""), e.showModal(), requestAnimationFrame(() => t.focus()), f(!0));
	}, _ = () => e.close(), v = () => m(t.value), y = (e) => {
		e.key === "ArrowDown" ? (e.preventDefault(), p(Math.min(u + 1, l.length - 1))) : e.key === "ArrowUp" ? (e.preventDefault(), p(Math.max(u - 1, 0))) : e.key === "Enter" ? (e.preventDefault(), u >= 0 && h(u)) : e.key === "Home" ? (e.preventDefault(), p(0)) : e.key === "End" && (e.preventDefault(), p(l.length - 1));
	}, b = (e) => {
		let t = e.target.closest(`.${WF.option}`);
		t?.dataset.href && window.location.assign(t.dataset.href);
	}, x = (t) => {
		t.target === e && _();
	}, S = () => f(!1);
	t.addEventListener("input", v), t.addEventListener("keydown", y), n.addEventListener("click", b), e.addEventListener("click", x), e.addEventListener("close", S);
	let C = () => g();
	for (let e of s) e.addEventListener("click", C);
	let w = c ? nI(c, g) : () => {};
	return () => {
		t.removeEventListener("input", v), t.removeEventListener("keydown", y), n.removeEventListener("click", b), e.removeEventListener("click", x), e.removeEventListener("close", S);
		for (let e of s) e.removeEventListener("click", C);
		w();
	};
}
var cI, lI, uI, dI, fI = t((() => {
	KF(), tI(), rI(), G(), cI = `[${GF.root}]`, lI = `[${GF.open}]`, uI = `[${GF.hint}]`, dI = Ms({
		key: "command-palette",
		rootSelector: cI,
		connect: sI
	});
}));
//#endregion
//#region packages/core/src/calendar.ts
function pI(e) {
	let t = bI(e);
	return (e) => e.unavailable ? t ? `Not available. ${e.valueText}` : `No disponible. ${e.valueText}` : e.firstInRange ? t ? `Starting range from ${e.valueText}` : `Inicio del rango desde ${e.valueText}` : e.lastInRange ? t ? `Range ending at ${e.valueText}` : `Fin del rango en ${e.valueText}` : e.selected ? t ? `Selected date. ${e.valueText}` : `Fecha seleccionada. ${e.valueText}` : t ? `Choose ${e.valueText}` : `Elegir ${e.valueText}`;
}
function mI(e) {
	let t = bI(e);
	return (e) => e === "year" ? t ? "Switch to month view" : "Cambiar a vista de mes" : e === "month" ? t ? "Switch to day view" : "Cambiar a vista de día" : t ? "Switch to year view" : "Cambiar a vista de año";
}
function hI(e) {
	let t = bI(e);
	return (e) => e === "year" ? t ? "Switch to previous decade" : "Década anterior" : e === "month" ? t ? "Switch to previous year" : "Año anterior" : t ? "Switch to previous month" : "Mes anterior";
}
function gI(e) {
	let t = bI(e);
	return (e) => e === "year" ? t ? "Switch to next decade" : "Década siguiente" : e === "month" ? t ? "Switch to next year" : "Año siguiente" : t ? "Switch to next month" : "Mes siguiente";
}
function _I() {
	return {
		monthSelect: "Select month",
		yearSelect: "Select year",
		presetTrigger: (e) => `select ${e[0] ?? ""} to ${e[1] ?? ""}`,
		clearTrigger: "Clear selected dates",
		placeholder: () => ({
			day: "dd",
			month: "mm",
			year: "yyyy"
		})
	};
}
function vI(e) {
	return e ? dw(e) : void 0;
}
function yI(e, t) {
	let n = e.short.match(xI) ?? [], r = e.long.match(xI) ?? [], i = n.length >= 2 ? n : r, a = i[0];
	if (a === void 0) return Array.from(e.short).slice(0, 2).join("");
	let o = i[1] ?? "";
	return a.toLocaleUpperCase(t) + o.toLocaleLowerCase(t);
}
var bI, xI, SI, CI = t((() => {
	Lw(), bI = (e) => e.toLocaleLowerCase().startsWith("en"), xI = /\p{L}\p{M}*/gu, SI = {
		root: "sk-calendar",
		label: "sk-calendar__label",
		header: "sk-calendar__header",
		heading: "sk-calendar__heading",
		viewTrigger: "sk-calendar__view-trigger",
		previous: "sk-calendar__previous",
		next: "sk-calendar__next",
		table: "sk-calendar__table",
		tableHeader: "sk-calendar__table-header",
		tableBody: "sk-calendar__table-body",
		cell: "sk-calendar__cell",
		cellTrigger: "sk-calendar__cell-trigger",
		monthGrid: "sk-calendar__month-grid",
		yearGrid: "sk-calendar__year-grid"
	};
}));
//#endregion
//#region packages/core/src/date-picker.ts
function wI(e) {
	let t = EI(e);
	return (e) => e ? t ? "Close calendar" : "Cerrar calendario" : t ? "Open calendar" : "Abrir calendario";
}
function TI(e) {
	return EI(e) ? "calendar" : "calendario";
}
var EI, DI, OI = t((() => {
	EI = (e) => e.toLocaleLowerCase().startsWith("en"), DI = {
		root: "sk-date-picker",
		label: "sk-date-picker__label",
		control: "sk-date-picker__control",
		input: "sk-date-picker__input",
		trigger: "sk-date-picker__trigger",
		clear: "sk-date-picker__clear",
		positioner: "sk-date-picker__positioner",
		content: "sk-date-picker__content"
	};
}));
//#endregion
//#region packages/vanilla/src/components/CalendarView.svelte
function kI(e, t) {
	Ft(t, !0);
	let n = `${v.root} ${v.interactive}`, { variant: r, size: i, iconOnly: a } = y.options, o = {
		[r.attr]: "ghost",
		[i.attr]: "sm"
	}, s = { [a.attr]: a.trueValue }, c = /* @__PURE__ */ R(() => {
		if (t.api.view === "day") return t.api.format(t.api.visibleRange.start, {
			month: "long",
			year: "numeric"
		});
		if (t.api.view === "month") return t.api.format(t.api.visibleRange.start, { year: "numeric" });
		let e = t.api.getDecade();
		return `${e.start ?? ""}–${e.end ?? ""}`;
	});
	function l() {
		let e = /* @__PURE__ */ new Date(), n = t.api.focusedValue.set({
			year: e.getFullYear(),
			month: e.getMonth() + 1,
			day: e.getDate()
		});
		t.api.setFocusedValue(n), t.api.setView("day");
	}
	let u = /* @__PURE__ */ R(() => t.api.view === "year" ? t.locale.toLocaleLowerCase().startsWith("en") ? "Back to current month" : "Volver al mes actual" : t.api.getViewTriggerProps()["aria-label"]), d = /* @__PURE__ */ R(() => t.api.view === "year" ? (e) => {
		e.preventDefault(), l();
	} : t.api.getViewTriggerProps().onclick), f = /* @__PURE__ */ R(() => {
		let e = t.api.getPrevTriggerProps({ view: t.api.view });
		return {
			...e,
			"aria-disabled": e.disabled ? "true" : void 0
		};
	}), p = /* @__PURE__ */ R(() => {
		let e = t.api.getNextTriggerProps({ view: t.api.view });
		return {
			...e,
			"aria-disabled": e.disabled ? "true" : void 0
		};
	});
	var m = FI(), h = Dr(m), g = Er(h);
	Io(g, () => ({
		...V(f),
		...o,
		...s,
		class: `${SI.previous ?? ""} ${n}`,
		type: "button"
	}));
	var _ = Or(g, 2);
	Io(_, (e) => ({
		...e,
		onclick: V(d),
		"aria-label": V(u),
		...o,
		class: `${SI.viewTrigger ?? ""} ${n}`,
		type: "button"
	}), [() => t.api.getViewTriggerProps()]);
	var b = Er(_);
	vt(), P(_), Io(Or(_, 2), () => ({
		...V(p),
		...o,
		...s,
		class: `${SI.next ?? ""} ${n}`,
		type: "button"
	})), P(h);
	var x = Or(h, 2), S = (e) => {
		var r = NI();
		Io(r, (e) => ({
			...e,
			class: SI.table
		}), [() => t.api.getTableProps()]);
		var i = Er(r);
		Io(i, (e) => ({
			...e,
			class: SI.tableHeader
		}), [() => t.api.getTableHeadProps()]);
		var a = Er(i);
		Io(a, (e) => ({ ...e }), [() => t.api.getTableRowProps()]), Wa(a, 21, () => t.api.weekDays, (e) => e.short, (e, n) => {
			var r = AI(), i = Er(r), a = Er(i, !0);
			P(i), P(r), Zr((e) => {
				Po(i, "title", V(n).long), ba(a, e);
			}, [() => yI(V(n), t.locale)]), va(e, r);
		}), P(a), P(i);
		var c = Or(i);
		Io(c, (e) => ({
			...e,
			class: SI.tableBody
		}), [() => t.api.getTableBodyProps()]), Wa(c, 21, () => t.api.weeks, Va, (e, r) => {
			var i = MI();
			Io(i, (e) => ({ ...e }), [() => t.api.getTableRowProps()]), Wa(i, 21, () => V(r), (e) => e.toString(), (e, r) => {
				var i = jI();
				Io(i, (e) => ({
					...e,
					class: SI.cell
				}), [() => t.api.getDayTableCellProps({
					value: V(r),
					visibleRange: t.api.visibleRange
				})]);
				var a = Er(i);
				Io(a, (e) => ({
					...e,
					...o,
					...s,
					class: `${SI.cellTrigger ?? ""} ${n}`,
					type: "button"
				}), [() => t.api.getDayTableCellTriggerProps({
					value: V(r),
					visibleRange: t.api.visibleRange
				})]);
				var c = Er(a, !0);
				P(a), P(i), Zr(() => ba(c, V(r).day)), va(e, i);
			}), P(i), va(e, i);
		}), P(c), P(r), va(e, r);
	}, C = (e) => {
		var r = PI();
		Io(r, (e) => ({
			...e,
			class: `${SI.table ?? ""} ${SI.monthGrid ?? ""}`
		}), [() => t.api.getTableProps({ view: "month" })]);
		var i = Er(r);
		Io(i, (e) => ({
			...e,
			class: SI.tableBody
		}), [() => t.api.getTableBodyProps({ view: "month" })]), Wa(i, 21, () => t.api.getMonthsGrid({
			columns: 4,
			format: "short"
		}), Va, (e, r) => {
			var i = MI();
			Io(i, (e) => ({ ...e }), [() => t.api.getTableRowProps({ view: "month" })]), Wa(i, 21, () => V(r), (e) => e.value, (e, r) => {
				var i = jI();
				Io(i, (e) => ({
					...e,
					class: SI.cell
				}), [() => t.api.getMonthTableCellProps({
					value: V(r).value,
					columns: 4
				})]);
				var a = Er(i);
				Io(a, (e) => ({
					...e,
					...o,
					class: `${SI.cellTrigger ?? ""} ${n}`,
					type: "button",
					disabled: V(r).disabled
				}), [() => t.api.getMonthTableCellTriggerProps({ value: V(r).value })]);
				var s = Er(a, !0);
				P(a), P(i), Zr(() => ba(s, V(r).label)), va(e, i);
			}), P(i), va(e, i);
		}), P(i), P(r), va(e, r);
	}, w = (e) => {
		var r = PI();
		Io(r, (e) => ({
			...e,
			class: `${SI.table ?? ""} ${SI.yearGrid ?? ""}`
		}), [() => t.api.getTableProps({ view: "year" })]);
		var i = Er(r);
		Io(i, (e) => ({
			...e,
			class: SI.tableBody
		}), [() => t.api.getTableBodyProps({ view: "year" })]), Wa(i, 21, () => t.api.getYearsGrid({ columns: 4 }), Va, (e, r) => {
			var i = MI();
			Io(i, (e) => ({ ...e }), [() => t.api.getTableRowProps({ view: "year" })]), Wa(i, 21, () => V(r), (e) => e.value, (e, r) => {
				var i = jI();
				Io(i, (e) => ({
					...e,
					class: SI.cell
				}), [() => t.api.getYearTableCellProps({
					value: V(r).value,
					columns: 4
				})]);
				var a = Er(i);
				Io(a, (e) => ({
					...e,
					...o,
					class: `${SI.cellTrigger ?? ""} ${n}`,
					type: "button",
					disabled: V(r).disabled
				}), [() => t.api.getYearTableCellTriggerProps({ value: V(r).value })]);
				var s = Er(a, !0);
				P(a), P(i), Zr(() => ba(s, V(r).label)), va(e, i);
			}), P(i), va(e, i);
		}), P(i), P(r), va(e, r);
	};
	La(x, (e) => {
		t.api.view === "day" ? e(S) : t.api.view === "month" ? e(C, 1) : e(w, -1);
	}), Zr(() => {
		Co(h, 1, go(SI.header)), ba(b, `${V(c) ?? ""} `);
	}), va(e, m), It();
}
var AI, jI, MI, NI, PI, FI, II = t((() => {
	Ts(), vs(), CI(), b(), AI = /* @__PURE__ */ ga("<th scope=\"col\"><abbr> </abbr></th>"), jI = /* @__PURE__ */ ga("<td><button> </button></td>"), MI = /* @__PURE__ */ ga("<tr></tr>"), NI = /* @__PURE__ */ ga("<table><thead><tr></tr></thead><tbody></tbody></table>"), PI = /* @__PURE__ */ ga("<table><tbody></tbody></table>"), FI = /* @__PURE__ */ ga("<div><button><span data-sk-icon=\"chevron-left\" data-sk-icon-size=\"sm\"></span></button> <button> <span aria-hidden=\"true\" data-sk-icon=\"chevron-down\" data-sk-icon-size=\"sm\"></span></button> <button><span data-sk-icon=\"chevron-right\" data-sk-icon-size=\"sm\"></span></button></div> <!>", 1);
}));
//#endregion
//#region packages/vanilla/src/components/DatePicker.svelte
function LI(e, t) {
	Ft(t, !0);
	let n = Is(), r = n.querySelector(`.${DI.label}`), i = n.querySelector(`.${DI.control}`), a = n.querySelector(`.${DI.input}`), o = n.querySelector(`.${DI.trigger}`), c = n.querySelector(`.${DI.clear}`), l = a?.getAttribute("placeholder") ?? null, u = c?.getAttribute("aria-label") ?? null;
	if (!i) throw Error(`[data-sk-date-picker] necesita un .${DI.control}.`);
	if (!a) throw Error(`[data-sk-date-picker] necesita un .${DI.input}.`);
	if (!o) throw Error(`[data-sk-date-picker] necesita un .${DI.trigger}.`);
	n.id ||= Ps("sk-date-picker");
	let d = n.dataset.locale || "es", f = /* @__PURE__ */ or(void 0), p = tM(XE, () => ({
		id: n.id,
		name: n.dataset.name || a.name || void 0,
		locale: d,
		timeZone: n.dataset.timeZone || "UTC",
		selectionMode: n.dataset.selectionMode === "range" ? "range" : "single",
		defaultValue: n.dataset.value?.split(" ").filter(Boolean).map((e) => vI(e)),
		min: vI(n.dataset.min),
		max: vI(n.dataset.max),
		disabled: n.hasAttribute("data-disabled"),
		readOnly: n.hasAttribute("data-readonly"),
		required: n.hasAttribute("data-required"),
		fixedWeeks: !0,
		translations: {
			..._I(),
			trigger: wI(d),
			content: TI(d),
			dayCell: pI(d),
			viewTrigger: mI(d),
			prevTrigger: hI(d),
			nextTrigger: gI(d)
		},
		onValueChange(e) {
			n.dispatchEvent(new CustomEvent("sk-value-change", {
				bubbles: !0,
				detail: { value: e.valueAsString }
			}));
		}
	})), m = /* @__PURE__ */ R(() => UE(p, Gj)), h = Gs(), g, _ = (e) => h ? Js(e) : e;
	Wr(() => {
		T(n, V(m).getRootProps()), r && T(r, V(m).getLabelProps()), T(i, V(m).getControlProps()), E(i, Zs.anchor), T(a, V(m).getInputProps({ index: 0 })), l !== null && (a.placeholder = l), T(o, V(m).getTriggerProps()), c && (T(c, V(m).getClearTriggerProps()), u !== null && c.setAttribute("aria-label", u), c.hidden = V(m).value.length === 0);
	});
	let v = [];
	bs(() => {
		v.push(D(a, () => V(m).getInputProps({ index: 0 }))), v.push(D(o, () => V(m).getTriggerProps())), c && v.push(D(c, () => V(m).getClearTriggerProps())), h && (g = qs(i, V(f), Ks(n.id))), s(n);
	}), xs(() => {
		for (let e of v) e();
		g?.();
	});
	var y = RI();
	Io(y, (e) => ({
		...e,
		class: `${DI.positioner ?? ""} ${Zs.positioner ?? ""}`
	}), [() => _(V(m).getPositionerProps())]);
	var b = Er(y);
	Io(b, (e) => ({
		...e,
		class: `${DI.content ?? ""} ${SI.root ?? ""}`
	}), [() => V(m).getContentProps()]), kI(Er(b), {
		get api() {
			return V(m);
		},
		get locale() {
			return d;
		}
	}), P(b), P(y), rs(y, (e) => cr(f, e), () => V(f)), va(e, y), It();
}
var RI, zI = t((() => {
	Ts(), vs(), ec(), zj(), CI(), OI(), aM(), Cs(), k(), G(), _(), II(), RI = /* @__PURE__ */ ga("<div><div><!></div></div>");
})), BI = /* @__PURE__ */ n({ mountDatePicker: () => VI }), VI, HI = t((() => {
	zI(), G(), VI = js({
		key: "date-picker",
		rootSelector: "[data-sk-date-picker]",
		Component: LI
	});
}));
//#endregion
//#region packages/core/src/time-field.ts
function UI(e) {
	if (!e) return;
	let t = rL.exec(e.trim());
	if (t) return {
		hour: Number(t[1]),
		minute: Number(t[2])
	};
}
function WI(e) {
	return `${String(GI(e.hour)).padStart(2, "0")}:${String(KI(e.minute)).padStart(2, "0")}`;
}
function GI(e) {
	return Math.min(Math.max(Math.trunc(e), 0), 23);
}
function KI(e) {
	return Math.min(Math.max(Math.trunc(e), 0), 59);
}
function qI(e) {
	let t = new Intl.DateTimeFormat(e, { hour: "numeric" }).resolvedOptions(), n = t.hourCycle ?? (t.hour12 ? "h12" : "h24");
	return n === "h11" || n === "h12" ? "h12" : "h24";
}
function JI(e, t) {
	return t ?? qI(e);
}
function YI(e, t, n) {
	if (!(e > 0)) return [];
	let r = new Intl.DateTimeFormat(t, {
		hour: "numeric",
		minute: "2-digit",
		hour12: n === "h12",
		timeZone: "UTC"
	}), i = [];
	for (let t = 0; t < 1440; t += e) {
		let e = Math.floor(t / 60), n = t % 60;
		i.push({
			value: WI({
				hour: e,
				minute: n
			}),
			label: r.format(new Date(Date.UTC(2e3, 0, 1, e, n)))
		});
	}
	return i;
}
function XI(e) {
	let t = e >= 12 ? "PM" : "AM";
	return {
		hour12: e % 12 == 0 ? 12 : e % 12,
		period: t
	};
}
function ZI(e, t) {
	let n = e % 12;
	return t === "PM" ? n + 12 : n;
}
function QI(e) {
	let t = (t) => new Intl.DateTimeFormat(e, {
		hour: "numeric",
		hour12: !0,
		timeZone: "UTC"
	}).formatToParts(new Date(Date.UTC(2e3, 0, 1, t))).find((e) => e.type === "dayPeriod")?.value ?? (t < 12 ? "AM" : "PM");
	return {
		AM: t(9),
		PM: t(21)
	};
}
function $I(e, t) {
	let n = new Date(Date.UTC(2020, 0, 1, 9, 5)), r = new Intl.DateTimeFormat(e, {
		hour: "numeric",
		minute: "2-digit",
		hour12: t === "h12",
		timeZone: "UTC"
	}).formatToParts(n), i = [];
	for (let e of r) e.type === "hour" || e.type === "minute" || e.type === "dayPeriod" ? i.push({
		kind: "segment",
		type: e.type
	}) : i.push({
		kind: "literal",
		value: eL(e.value)
	});
	return i;
}
function eL(e) {
	return e.trim() === "" && e !== "" ? iL : e;
}
function tL(e, t) {
	return e === "hour" ? t === "h12" ? {
		min: 1,
		max: 12
	} : {
		min: 0,
		max: 23
	} : e === "minute" ? {
		min: 0,
		max: 59
	} : {
		min: 0,
		max: 1
	};
}
var nL, rL, iL, aL = t((() => {
	nL = {
		root: "sk-time-field",
		label: "sk-time-field__label",
		hint: "sk-time-field__hint",
		control: "sk-time-field__control",
		segment: "sk-time-field__segment",
		literal: "sk-time-field__literal",
		clear: "sk-time-field__clear",
		trailing: "sk-time-field__trailing"
	}, rL = /^([01]?\d|2[0-3]):([0-5]\d)$/, iL = " ";
}));
//#endregion
//#region packages/vanilla/src/components/TimeField.svelte
function oL(e, t) {
	Ft(t, !0);
	let n = Is(), r = /* @__PURE__ */ or(void 0), i = /* @__PURE__ */ or(void 0), a = /* @__PURE__ */ or(void 0), o = /* @__PURE__ */ or(void 0), c = /* @__PURE__ */ or(void 0), l = n.querySelector(`.${nL.label}`), u = n.querySelector(`.${nL.hint}`), d = n.id || Ps("sk-time-field"), f = n.dataset.locale || "es", p = n.dataset.hourCycle, m = Number(n.dataset.minuteStep) || 1, h = n.hasAttribute("data-disabled"), g = n.hasAttribute("data-readonly"), _ = n.hasAttribute("data-required"), v = n.dataset.name || void 0, y = n.dataset.hourLabel || "Hora", b = n.dataset.minuteLabel || "Minuto", x = n.dataset.periodLabel || "Periodo", S = n.dataset.clearLabel || "Limpiar hora", C = Number(n.dataset.optionsStep) || 30, w = n.dataset.optionsLabel || "Elegir de la lista", E = l ? l.id ||= `${d}-label` : void 0, ee = u ? u.id ||= `${d}-hint` : void 0, O = JI(f, p), te = QI(f), ne = $I(f, O), re = ne.filter((e) => e.kind === "segment").map((e) => e.type), ie = {
		hour: y,
		minute: b,
		dayPeriod: x
	};
	function k(e) {
		if (!e) return {};
		if (O === "h24") return {
			hour: e.hour,
			minute: e.minute
		};
		let { hour12: t, period: n } = XI(e.hour);
		return {
			hour: t,
			minute: e.minute,
			dayPeriod: n === "AM" ? 0 : 1
		};
	}
	function ae(e) {
		if (e.minute === void 0) return;
		if (O === "h24") return e.hour === void 0 ? void 0 : {
			hour: e.hour,
			minute: e.minute
		};
		if (e.hour === void 0 || e.dayPeriod === void 0) return;
		let t = e.dayPeriod === 0 ? "AM" : "PM";
		return {
			hour: ZI(e.hour, t),
			minute: e.minute
		};
	}
	function A(e, t, n, r) {
		let i = r - n + 1;
		return ((e + t - n) % i + i) % i + n;
	}
	function oe(e, t) {
		return t === void 0 ? e === "hour" ? "hh" : e === "minute" ? "mm" : "–" : e === "dayPeriod" ? t === 0 ? te.AM : te.PM : String(t).padStart(2, "0");
	}
	let se = /* @__PURE__ */ or(_r(k(UI(n.dataset.value)))), ce = /* @__PURE__ */ R(() => ae(V(se))), le = /* @__PURE__ */ R(() => V(ce) !== void 0);
	Wr(() => {
		V(r)?.setAttribute("value", V(ce) ? WI(V(ce)) : "");
	}), Wr(() => {
		V(le), s(n);
	});
	function j(e) {
		cr(se, e, !0);
		let t = V(ce) ? WI(V(ce)) : "";
		n.dispatchEvent(new CustomEvent("sk-value-change", {
			bubbles: !0,
			detail: { value: t }
		}));
	}
	let ue = YI(C, f, O), de = S_({
		items: [...ue],
		itemToString: (e) => e.label,
		itemToValue: (e) => e.value
	}), fe = `${d}-options`, pe = Gs() ? Ks(fe) : null, me, he = tM(mx, () => ({
		id: fe,
		collection: de,
		value: V(ce) ? [WI(V(ce))] : [],
		positioning: { sameWidth: !1 },
		onValueChange(e) {
			let t = e.value[0];
			if (t === void 0) return;
			let n = UI(t);
			n && j(k(n));
		}
	})), ge = /* @__PURE__ */ R(() => Tb(he, Gj));
	function _e(e) {
		let t = { ...e };
		return delete t["aria-labelledby"], t;
	}
	Wr(() => {
		V(a) && T(V(a), _e(V(ge).getTriggerProps()));
		let e = V(ge).getPositionerProps();
		V(o) && T(V(o), pe ? Js(e) : e), V(c) && T(V(c), _e(V(ge).getContentProps())), (V(c) ? Array.from(V(c).querySelectorAll(`.${nc.item}`)) : []).forEach((e, t) => {
			let n = ue[t];
			if (!n) return;
			let r = V(ge).getItemProps({ item: n });
			r["aria-selected"] = n.value === V(ge).highlightedValue ? "true" : void 0, T(e, r);
			let i = e.querySelector(`.${nc.itemText}`);
			i && T(i, V(ge).getItemTextProps({ item: n }));
			let a = e.querySelector(`.${nc.itemIndicator}`);
			a && T(a, V(ge).getItemIndicatorProps({ item: n }));
		}), pe && V(o) && V(i) && (me = qs(V(i), V(o), pe));
	});
	let ve = [];
	bs(() => {
		V(a) && ve.push(D(V(a), () => V(ge).getTriggerProps())), V(c) && (ve.push(D(V(c), () => V(ge).getContentProps())), Array.from(V(c).querySelectorAll(`.${nc.item}`)).forEach((e, t) => {
			let n = ue[t];
			n && ve.push(D(e, () => V(ge).getItemProps({ item: n })));
		}));
	}), xs(() => {
		for (let e of ve) e();
		me?.();
	}), bs(() => {
		let e = new MutationObserver(() => {
			j(k(UI(n.dataset.value)));
		});
		return e.observe(n, { attributeFilter: ["data-value"] }), () => e.disconnect();
	});
	let ye = (e) => `[data-sk-time-field-segment="${e}"]`, M = (e, t) => {
		let r = re[re.indexOf(e) + t];
		r && n.querySelector(ye(r))?.focus();
	}, be = null, xe;
	function Se(e, t) {
		let { min: n, max: r } = tL(e, O), i, a;
		be && be.type === e && be.digits < 2 && be.value * 10 + t <= r ? (i = be.value * 10 + t, a = be.digits + 1) : (i = t, a = 1), be = {
			type: e,
			value: i,
			digits: a
		}, j({
			...V(se),
			[e]: Math.max(i, n)
		}), clearTimeout(xe), a >= 2 || i * 10 > r ? (be = null, M(e, 1)) : xe = setTimeout(() => {
			be = null, M(e, 1);
		}, 500);
	}
	function Ce(e, t) {
		if (h || g) return;
		if (t.altKey) {
			if (t.key === "ArrowDown") {
				let e = V(i)?.querySelector(`.${nL.trailing} button`);
				e && (t.preventDefault(), e.click());
			}
			return;
		}
		let { min: n, max: r } = tL(e, O), a = V(se)[e];
		if (e !== "dayPeriod" && t.key >= "0" && t.key <= "9") {
			t.preventDefault(), Se(e, Number(t.key));
			return;
		}
		if (e === "dayPeriod") {
			let e = t.key.toLowerCase();
			if (e.length === 1 && te.AM.toLowerCase().startsWith(e)) {
				t.preventDefault(), j({
					...V(se),
					dayPeriod: 0
				});
				return;
			}
			if (e.length === 1 && te.PM.toLowerCase().startsWith(e)) {
				t.preventDefault(), j({
					...V(se),
					dayPeriod: 1
				});
				return;
			}
		}
		switch (t.key) {
			case "ArrowUp": {
				t.preventDefault(), be = null;
				let i = e === "minute" ? m : 1;
				j({
					...V(se),
					[e]: a === void 0 ? n : A(a, i, n, r)
				});
				return;
			}
			case "ArrowDown": {
				t.preventDefault(), be = null;
				let i = e === "minute" ? m : 1;
				j({
					...V(se),
					[e]: a === void 0 ? r : A(a, -i, n, r)
				});
				return;
			}
			case "ArrowLeft":
				t.preventDefault(), M(e, -1);
				return;
			case "ArrowRight":
				t.preventDefault(), M(e, 1);
				return;
			case "Home":
				t.preventDefault(), be = null, j({
					...V(se),
					[e]: n
				});
				return;
			case "End":
				t.preventDefault(), be = null, j({
					...V(se),
					[e]: r
				});
				return;
			case "Backspace":
			case "Delete": {
				t.preventDefault(), be = null;
				let n = { ...V(se) };
				delete n[e], j(n);
				return;
			}
		}
	}
	var we = pL(), Te = Dr(we), Ee = Er(Te);
	Wa(Ee, 17, () => ne, Va, (e, t) => {
		var n = _a(), r = Dr(n), i = (e) => {
			var n = sL(), r = Er(n, !0);
			P(n), Zr(() => {
				Co(n, 1, go(nL.literal)), ba(r, V(t).value);
			}), va(e, n);
		}, a = (e) => {
			var n = cL(), r = Er(n, !0);
			P(n), Zr((e, i, a, o) => {
				Po(n, "aria-label", ie[V(t).type]), Po(n, "aria-required", _ ? "true" : void 0), Po(n, "aria-valuemax", e), Po(n, "aria-valuemin", i), Po(n, "aria-valuenow", V(se)[V(t).type]), Po(n, "aria-valuetext", a), Co(n, 1, go(nL.segment)), Po(n, "data-placeholder", V(se)[V(t).type] === void 0 ? "" : void 0), Po(n, "data-sk-time-field-segment", V(t).type), Po(n, "tabindex", h ? -1 : 0), ba(r, o);
			}, [
				() => tL(V(t).type, O).max,
				() => tL(V(t).type, O).min,
				() => oe(V(t).type, V(se)[V(t).type]),
				() => oe(V(t).type, V(se)[V(t).type])
			]), na("focus", n, () => {
				be = null;
			}), ra("keydown", n, (e) => Ce(V(t).type, e)), va(e, n);
		};
		La(r, (e) => {
			V(t).kind === "literal" ? e(i) : e(a, -1);
		}), va(e, n);
	});
	var De = Or(Ee, 2), Oe = (e) => {
		var t = lL();
		Zr(() => {
			Po(t, "aria-label", S), Co(t, 1, `${nL.clear ?? ""} sk-button sk-interactive`);
		}), ra("click", t, () => j({})), va(e, t);
	};
	La(De, (e) => {
		V(le) && !h && !g && e(Oe);
	});
	var ke = Or(De, 2), Ae = (e) => {
		var t = uL(), n = Er(t);
		rs(n, (e) => cr(a, e), () => V(a)), P(t), Zr(() => {
			Co(t, 1, go(nL.trailing)), Po(n, "aria-label", w);
		}), va(e, t);
	};
	La(ke, (e) => {
		!h && !g && e(Ae);
	}), P(Te), rs(Te, (e) => cr(i, e), () => V(i));
	var je = Or(Te, 2), Me = (e) => {
		var t = fL(), n = Er(t);
		Wa(n, 21, () => ue, (e) => e.value, (e, t) => {
			var n = dL(), r = Er(n), i = Er(r, !0);
			P(r);
			var a = Or(r, 2);
			P(n), Zr(() => {
				Co(n, 1, `${nc.item ?? ""} sk-interactive`), Co(r, 1, go(nc.itemText)), ba(i, V(t).label), Co(a, 1, go(nc.itemIndicator));
			}), va(e, n);
		}), P(n), rs(n, (e) => cr(c, e), () => V(c)), P(t), rs(t, (e) => cr(o, e), () => V(o)), Zr(() => {
			Co(t, 1, `${nc.positioner ?? ""} sk-anchored sk-time-field__options-positioner`), Po(n, "aria-label", w), Co(n, 1, `${nc.content ?? ""} sk-scrollbar`);
		}), va(e, t);
	};
	La(je, (e) => {
		!h && !g && e(Me);
	});
	var Ne = Or(je, 2);
	rs(Ne, (e) => cr(r, e), () => V(r)), Zr(() => {
		Po(Te, "aria-describedby", ee), Po(Te, "aria-labelledby", E), Co(Te, 1, `${nL.control ?? ""} sk-anchor`), Po(Te, "data-disabled", h ? "" : void 0), Po(Ne, "name", v);
	}), va(e, we), It();
}
var sL, cL, lL, uL, dL, fL, pL, mL = t((() => {
	Ts(), vs(), ec(), zj(), ic(), aL(), aM(), Cs(), k(), G(), _(), sL = /* @__PURE__ */ ga("<span aria-hidden=\"true\"> </span>"), cL = /* @__PURE__ */ ga("<div role=\"spinbutton\"> </div>"), lL = /* @__PURE__ */ ga("<button data-icon-only=\"\" data-size=\"sm\" data-variant=\"ghost\" type=\"button\"><span data-sk-icon=\"close\" data-sk-icon-size=\"sm\"></span></button>"), uL = /* @__PURE__ */ ga("<span><button class=\"sk-button sk-interactive sk-time-field__options-trigger\" data-icon-only=\"\" data-size=\"sm\" data-variant=\"ghost\" type=\"button\"><span data-sk-icon=\"clock\" data-sk-icon-size=\"sm\"></span></button></span>"), dL = /* @__PURE__ */ ga("<li><span> </span> <span><span data-sk-icon=\"check\" data-sk-icon-size=\"md\"></span></span></li>"), fL = /* @__PURE__ */ ga("<div data-sk-placement=\"block-end\"><ul></ul></div>"), pL = /* @__PURE__ */ ga("<div role=\"group\"><!> <!> <!></div> <!> <input type=\"hidden\"/>", 1), ia(["keydown", "click"]);
})), hL = /* @__PURE__ */ n({ mountTimeField: () => gL }), gL, _L = t((() => {
	mL(), G(), gL = js({
		key: "time-field",
		rootSelector: "[data-sk-time-field]",
		Component: oL
	});
}));
//#endregion
//#region packages/vanilla/src/components/Calendar.svelte
function vL(e, t) {
	Ft(t, !0);
	let n = Is();
	n.id ||= Ps("sk-calendar");
	let r = n.dataset.locale || "es", i = tM(XE, () => ({
		id: n.id,
		locale: r,
		timeZone: n.dataset.timeZone || "UTC",
		selectionMode: n.dataset.selectionMode === "range" ? "range" : "single",
		defaultValue: n.dataset.value?.split(" ").filter(Boolean).map((e) => vI(e)).filter(Boolean),
		min: vI(n.dataset.min),
		max: vI(n.dataset.max),
		disabled: n.hasAttribute("data-disabled"),
		readOnly: n.hasAttribute("data-readonly"),
		inline: !0,
		fixedWeeks: !0,
		translations: {
			..._I(),
			trigger: () => "",
			content: "",
			dayCell: pI(r),
			viewTrigger: mI(r),
			prevTrigger: hI(r),
			nextTrigger: gI(r)
		},
		onValueChange(e) {
			n.dispatchEvent(new CustomEvent("sk-value-change", {
				bubbles: !0,
				detail: { value: e.valueAsString }
			}));
		}
	})), a = /* @__PURE__ */ R(() => UE(i, Gj));
	Wr(() => {
		T(n, V(a).getRootProps());
	}), bs(() => {
		s(n);
	}), kI(e, {
		get api() {
			return V(a);
		},
		get locale() {
			return r;
		}
	}), It();
}
var yL = t((() => {
	Ts(), vs(), zj(), CI(), aM(), Cs(), k(), G(), _(), II();
})), bL = /* @__PURE__ */ n({ mountCalendar: () => xL }), xL, SL = t((() => {
	yL(), G(), xL = js({
		key: "calendar",
		rootSelector: "[data-sk-calendar]",
		Component: vL
	});
})), CL, wL, TL, EL = t((() => {
	ec(), CL = Ys, wL = Xs, TL = "block-start";
}));
//#endregion
//#region packages/vanilla/src/components/Tooltip.svelte
function DL(e, t) {
	Ft(t, !0);
	let n = Is(), r = n.querySelector("[data-sk-anchor-trigger]"), i = n.querySelector("[data-sk-anchor-positioner]"), a = n.querySelector("[data-sk-anchor-content]"), o = i?.querySelector(`.${Zs.arrow}`) ?? null;
	n.id ||= Ps("sk-tooltip");
	let s = (e) => {
		let t = n.getAttribute(e);
		if (t === null) return;
		let r = Number.parseInt(t, 10);
		return Number.isFinite(r) ? r : void 0;
	}, c = n.getAttribute("data-interactive") !== "false", l = n.getAttribute("data-sk-placement"), u = CL.includes(l) ? l : TL;
	i?.setAttribute("data-sk-placement", u);
	let d = tM(Ix, () => ({
		id: n.id,
		ids: {
			trigger: r?.id || void 0,
			content: a?.id || void 0
		},
		openDelay: s("data-open-delay"),
		closeDelay: s("data-close-delay"),
		interactive: c,
		positioning: { placement: wL[u] },
		disabled: n.hasAttribute("data-disabled"),
		onOpenChange(e) {
			n.dispatchEvent(new CustomEvent("sk-open-change", {
				bubbles: !0,
				detail: { open: e.open }
			}));
		}
	})), f = /* @__PURE__ */ R(() => Mx(d, Gj)), p = Gs(), m;
	p && r && (m = qs(r, i, Ks(n.id)));
	let h = (e) => p ? Js(e) : e;
	Wr(() => {
		let e = V(f).getContentProps();
		if (r && T(r, V(f).getTriggerProps()), i && T(i, h(V(f).getPositionerProps())), o && !p) {
			T(o, V(f).getArrowProps());
			let t = e["data-side"];
			typeof t == "string" && o.setAttribute("data-side", t);
		}
		a && (T(a, e), c ? a.removeAttribute("data-interactive") : a.setAttribute("data-interactive", "false"));
	});
	let g = [];
	bs(() => {
		r && g.push(D(r, () => V(f).getTriggerProps())), a && g.push(D(a, () => V(f).getContentProps()));
	}), xs(() => {
		for (let e of g) e();
		m?.();
	}), It();
}
var OL = t((() => {
	Ts(), vs(), ec(), zj(), EL(), aM(), Cs(), k(), G();
})), kL = /* @__PURE__ */ n({ mountTooltip: () => AL }), AL, jL = t((() => {
	OL(), G(), AL = js({
		key: "anchor",
		rootSelector: "[data-sk-anchor]",
		Component: DL
	});
}));
//#endregion
//#region packages/core/src/menu.ts
function ML(e) {
	let { also: t, children: n, part: r, ...i } = e, a = r ? NL[r] : void 0;
	return {
		...i,
		...a || t ? { also: [...a ? [a] : [], ...t ?? []] } : {},
		...n ? { children: n.map(ML) } : {}
	};
}
var NL, PL, FL, IL, LL = t((() => {
	NL = {
		root: "sk-menu",
		trigger: "sk-menu__trigger",
		positioner: "sk-menu__positioner",
		content: "sk-menu__content",
		item: "sk-menu__item",
		itemLabel: "sk-menu__item-label",
		itemIndicator: "sk-menu__item-indicator",
		separator: "sk-menu__separator",
		group: "sk-menu__group",
		groupLabel: "sk-menu__group-label",
		safeArea: "sk-menu__safe-area",
		intentReadout: "sk-menu__intent-readout",
		intentReadoutDot: "sk-menu__intent-readout-dot"
	}, PL = {
		root: "data-sk-menu",
		trigger: "data-sk-menu-trigger",
		contextTrigger: "data-sk-menu-context-trigger",
		positioner: "data-sk-menu-positioner",
		content: "data-sk-menu-content",
		item: "data-sk-menu-item",
		optionItem: "data-sk-menu-option-item",
		safeArea: "data-sk-menu-safe-area",
		separator: "data-sk-menu-separator",
		group: "data-sk-menu-group",
		groupLabel: "data-sk-menu-group-label",
		debugSafetyTriangle: "data-sk-menu-debug-intent"
	}, FL = {
		element: "div",
		part: "positioner",
		also: ["sk-anchored"],
		mount: PL.positioner,
		children: [{
			element: "div",
			part: "content",
			mount: PL.content,
			children: [{
				repeat: "items",
				children: [{
					name: "entry",
					children: [
						{
							element: "div",
							part: "item",
							also: ["sk-interactive"],
							mount: PL.item,
							itemOptions: [
								"value",
								"disabled",
								"kind",
								"tone"
							],
							whenItemSlotMissing: "children",
							whenItemNotEquals: {
								option: "kind",
								equals: "separator"
							},
							whenItemMissing: "href",
							children: [{
								element: "span",
								part: "itemLabel",
								itemSlot: "label"
							}, {
								element: "span",
								part: "itemIndicator",
								attrs: { "aria-hidden": "true" },
								whenItemGiven: "kind",
								children: [{
									element: "span",
									attrs: {
										"data-sk-icon": "check",
										"data-sk-icon-size": "md"
									}
								}]
							}]
						},
						{
							element: "a",
							part: "item",
							also: ["sk-interactive"],
							mount: PL.item,
							itemOptions: [
								"value",
								"disabled",
								"kind",
								"tone",
								"href"
							],
							whenItemSlotMissing: "children",
							whenItemNotEquals: {
								option: "kind",
								equals: "separator"
							},
							whenItemGiven: "href",
							children: [{
								element: "span",
								part: "itemLabel",
								itemSlot: "label"
							}, {
								element: "span",
								part: "itemIndicator",
								attrs: { "aria-hidden": "true" },
								whenItemGiven: "kind",
								children: [{
									element: "span",
									attrs: {
										"data-sk-icon": "check",
										"data-sk-icon-size": "md"
									}
								}]
							}]
						},
						{
							element: "div",
							part: "separator",
							mount: PL.separator,
							attrs: { role: "separator" },
							whenItemEquals: {
								option: "kind",
								equals: "separator"
							}
						},
						{
							element: "div",
							part: "root",
							mount: PL.root,
							whenItemSlotGiven: "children",
							children: [{
								element: "button",
								part: "item",
								also: ["sk-interactive", "sk-anchor"],
								mount: PL.trigger,
								attrs: { type: "button" },
								children: [{
									element: "span",
									part: "itemLabel",
									itemSlot: "label"
								}, {
									element: "span",
									part: "itemIndicator",
									attrs: { "aria-hidden": "true" },
									children: [{
										element: "span",
										attrs: {
											"data-sk-icon": "chevron-right",
											"data-sk-icon-size": "md"
										}
									}]
								}]
							}, {
								element: "div",
								part: "positioner",
								also: ["sk-anchored"],
								mount: PL.positioner,
								attrs: { "data-sk-submenu": "" },
								children: [{
									element: "div",
									part: "content",
									mount: PL.content,
									children: [{
										repeatItemSlot: "children",
										recurse: "entry"
									}]
								}]
							}]
						}
					]
				}]
			}]
		}]
	}, IL = ML(FL), PL.debugSafetyTriangle, PL.root, PL.trigger;
}));
//#endregion
//#region packages/core/src/menu-intent-readout.ts
function RL(e, t) {
	let n = zL.get(e);
	if (n) return n;
	let r = e.ownerDocument ?? document, i = r.createElement("p");
	i.className = NL.intentReadout;
	let a = r.createElement("span");
	a.className = NL.intentReadoutDot, a.setAttribute("aria-hidden", "true");
	let o = r.createElement("span");
	i.append(a, o), e.prepend(i);
	let s = /* @__PURE__ */ new Set(), c = () => {
		let e = s.size > 0;
		i.setAttribute("data-locked", String(e)), o.textContent = `${t.label}: ${e ? t.lockedText : t.freeText}`;
	};
	c();
	let l = {
		report(e, t) {
			t ? s.add(e) : s.delete(e), c();
		},
		release(e) {
			s.delete(e), c();
		},
		destroy() {
			i.remove(), zL.delete(e);
		}
	};
	return zL.set(e, l), l;
}
var zL, BL = t((() => {
	LL(), zL = /* @__PURE__ */ new WeakMap();
}));
//#endregion
//#region packages/core/src/menu-safe-area.ts
function VL(e, t, n) {
	let r, i;
	if (n.left >= t.right) r = n.left, i = !0;
	else if (n.right <= t.left) r = n.right, i = !1;
	else return null;
	if (i ? e.x >= r : e.x <= r) return null;
	let a = e.x + (i ? -4 : WL), o = Math.min(a, r), s = Math.min(e.y, n.top), c = Math.abs(r - a), l = Math.max(e.y, n.bottom) - s;
	if (l < 1) return null;
	let u = (e, t) => `${((e - o) / c * 100).toFixed(3)}% ${((t - s) / l * 100).toFixed(3)}%`;
	return {
		left: o,
		top: s,
		width: c,
		height: l,
		clipPath: `polygon(${u(a, e.y)},${u(r, n.top)},${u(r, n.bottom)})`
	};
}
function HL(e, t) {
	let n = t.defaultView, r = e.parentElement;
	for (; r && r !== t.body;) {
		let e = n?.getComputedStyle(r);
		if (e && (e.transform !== "none" || e.filter !== "none" || e.perspective !== "none" || e.backdropFilter !== "none" || e.willChange.includes("transform") || /paint|layout|strict|content/.test(e.contain))) {
			let e = r.getBoundingClientRect();
			return {
				x: e.left,
				y: e.top
			};
		}
		r = r.parentElement;
	}
	return {
		x: 0,
		y: 0
	};
}
function UL(e, t = {}) {
	let n = t.doc ?? e.ownerDocument ?? document, r = t.dwellMs ?? 300, i = null, a = !1, o = null, s = "", c = null, l = (e) => {
		a !== e && (a = e, t.onHoldChange?.(e));
	}, u = () => {
		o != null && clearTimeout(o), o = null;
	}, d = () => {
		u(), o = setTimeout(p, r);
	};
	function f() {
		if (i) return i;
		let r = n.createElement("span");
		return r.className = "sk-menu__safe-area", r.setAttribute("aria-hidden", "true"), t.debug && r.setAttribute("data-debug", ""), r.addEventListener("pointerenter", () => {
			l(!0), d();
		}), r.addEventListener("pointermove", d), r.addEventListener("pointerleave", p), r.addEventListener("pointerdown", p), e.appendChild(r), e.setAttribute(GL, ""), i = r, c = HL(e, n), r;
	}
	function p() {
		u(), l(!1), s = "", i?.remove(), i = null, c = null, e.removeAttribute(GL);
	}
	return {
		aim(t, n) {
			if (a) return;
			let r = VL(t, e.getBoundingClientRect(), n);
			if (!r) {
				p();
				return;
			}
			let i = f(), o = `${r.left},${r.top},${r.width},${r.height},${r.clipPath}`;
			o !== s && (s = o, i.style.left = `${r.left - (c?.x ?? 0)}px`, i.style.top = `${r.top - (c?.y ?? 0)}px`, i.style.width = `${r.width}px`, i.style.height = `${r.height}px`, i.style.clipPath = r.clipPath);
		},
		clear: p,
		destroy: p
	};
}
var WL, GL, KL = t((() => {
	WL = 4, GL = "data-sk-menu-safe-area";
}));
//#endregion
//#region packages/vanilla/src/components/Menu.svelte
function qL(e) {
	return YL.get(e)?.getApi();
}
function JL(e, t) {
	Ft(t, !0);
	let n = Is(), r = {
		trigger: "[data-sk-menu-trigger]",
		contextTrigger: "[data-sk-menu-context-trigger]",
		positioner: "[data-sk-menu-positioner]",
		content: "[data-sk-menu-content]",
		item: "[data-sk-menu-item]",
		itemLabel: "[data-sk-menu-item-label], .sk-menu__item-label",
		itemIndicator: "[data-sk-menu-item-indicator], .sk-menu__item-indicator",
		root: "[data-sk-menu]"
	}, i = (e, t) => e.hasAttribute(t), a = n.querySelector(r.trigger), o = n.querySelector(r.contextTrigger), s = n.querySelector(r.positioner), c = n.querySelector(r.content), l = !!((a || o) && s && c), u = Array.from(n.querySelectorAll(r.item)).filter((e) => e.closest(r.root) === n).map((e) => ({
		node: e,
		value: e.dataset.value ?? e.textContent?.trim() ?? "",
		label: e.dataset.valueText ?? e.textContent?.trim() ?? "",
		kind: e.dataset.type ?? "item",
		group: e.dataset.group,
		labelNode: e.querySelector(r.itemLabel),
		indicatorNode: e.querySelector(r.itemIndicator)
	})), d = n.id || Ps("sk-menu"), f = a, p = !!n.parentElement?.closest(r.root) || !!n.querySelector(r.root), m = Gs() && !p && f ? Ks(d) : null, h, g = tM(Zk, () => ({
		id: d,
		"aria-label": n.getAttribute("aria-label") ?? void 0,
		defaultOpen: n.hasAttribute("data-open"),
		positioning: {
			placement: "bottom-start",
			strategy: "fixed"
		},
		onOpenChange(e) {
			n.dispatchEvent(new CustomEvent("sk-open-change", {
				bubbles: !0,
				detail: { open: e.open }
			}));
		}
	})), _ = /* @__PURE__ */ R(() => Kk(g, Gj)), v = n.parentElement?.closest(r.root), y = v ? YL.get(v) : void 0;
	YL.set(n, {
		service: g,
		getApi: () => V(_)
	});
	let b = n.closest(`[${PL.debugSafetyTriangle}]`), x = b ? RL(b, {
		label: "Pointer routing",
		lockedText: "locked",
		freeText: "free"
	}) : null, S = b === n, C = null;
	y && a && (C = UL(a, {
		debug: b != null,
		onHoldChange: (e) => x?.report(d, e)
	}));
	let w = () => {
		c && c.dataset.state !== "open" && C?.clear();
	}, E = () => y ? y.getApi().getTriggerItemProps(V(_)) : V(_).getTriggerProps(), ee = (e) => e.kind === "item" ? V(_).getItemProps({
		value: e.value,
		valueText: e.label,
		disabled: i(e.node, "disabled")
	}) : V(_).getOptionItemProps({
		value: e.value,
		valueText: e.label,
		disabled: i(e.node, "disabled"),
		type: e.kind,
		checked: i(e.node, "data-checked"),
		onCheckedChange(t) {
			if (e.kind === "radio" && t) for (let t of u) t.kind === "radio" && t.group === e.group && t.node.removeAttribute("data-checked");
			e.node.toggleAttribute("data-checked", t), n.dispatchEvent(new CustomEvent("sk-checked-change", {
				bubbles: !0,
				detail: {
					value: e.value,
					checked: t
				}
			}));
		}
	});
	Wr(() => {
		if (!l || !s || !c) return;
		a && T(a, E()), o && T(o, V(_).getContextTriggerProps());
		let e = V(_).getPositionerProps();
		T(s, m ? Js(e) : e), m && f && (h = qs(f, s, m)), T(c, V(_).getContentProps());
		for (let e of u) {
			T(e.node, ee(e));
			let t = {
				value: e.value,
				valueText: e.label,
				disabled: i(e.node, "disabled"),
				checked: e.kind === "item" ? void 0 : i(e.node, "data-checked")
			};
			e.labelNode && T(e.labelNode, V(_).getItemTextProps(t)), e.indicatorNode && T(e.indicatorNode, V(_).getItemIndicatorProps(t));
		}
		w();
	});
	let O = [];
	bs(() => {
		if (l) {
			y && (Kk(g, Gj).setParent(y.service), y.getApi().setChild(g)), a && O.push(D(a, () => E())), o && O.push(D(o, () => V(_).getContextTriggerProps())), c && O.push(D(c, () => V(_).getContentProps()));
			for (let e of u) O.push(D(e.node, () => ee(e)));
			if (C && a) {
				let e = (e) => {
					e.pointerType === "mouse" && (!c || c.dataset.state !== "open" || C?.aim({
						x: e.clientX,
						y: e.clientY
					}, c.getBoundingClientRect()));
				};
				a.addEventListener("pointermove", e), O.push(() => a.removeEventListener("pointermove", e));
			}
			if (y && a) {
				let e = (e) => {
					let t = document.documentElement.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
					e.key === t && V(_).setOpen(!0);
				};
				a.addEventListener("keydown", e), O.push(() => a.removeEventListener("keydown", e));
			}
			for (let e of u) {
				if (e.kind !== "item") continue;
				let t = () => {
					i(e.node, "disabled") || n.dispatchEvent(new CustomEvent("sk-select", {
						bubbles: !0,
						detail: { value: e.value }
					}));
				};
				e.node.addEventListener("click", t), O.push(() => e.node.removeEventListener("click", t));
			}
		}
	}), xs(() => {
		for (let e of O) e();
		h?.(), C?.destroy(), S ? x?.destroy() : x?.release(d), YL.delete(n);
	}), It();
}
var YL, XL = t((() => {
	Ts(), vs(), ec(), zj(), LL(), BL(), KL(), aM(), Cs(), k(), G(), YL = /* @__PURE__ */ new WeakMap();
})), ZL = /* @__PURE__ */ n({ mountMenu: () => QL }), QL, $L = t((() => {
	XL(), G(), QL = js({
		key: "menu",
		rootSelector: "[data-sk-menu]",
		Component: JL
	});
})), eR, tR = t((() => {
	ic(), eR = {
		root: "sk-combobox",
		label: "sk-combobox__label",
		control: "sk-combobox__control",
		value: "sk-combobox__value",
		selectedItems: "sk-combobox__selected-items",
		selectedItem: "sk-combobox__selected-item",
		selectedItemLabel: "sk-combobox__selected-item-label",
		removeTrigger: "sk-combobox__remove-trigger",
		input: "sk-combobox__input",
		trigger: "sk-combobox__trigger",
		clear: "sk-combobox__clear",
		positioner: "sk-combobox__positioner",
		content: "sk-combobox__content",
		item: "sk-combobox__item",
		itemCopy: "sk-combobox__item-copy",
		itemLabel: "sk-combobox__item-label",
		itemIndicator: "sk-combobox__item-indicator",
		itemDescription: "sk-combobox__item-description",
		empty: "sk-combobox__empty",
		status: "sk-combobox__status"
	}, { ...rc }, { ...rc.slots };
}));
//#endregion
//#region packages/vanilla/src/components/Combobox.svelte
function nR(e, t) {
	Ft(t, !0);
	let n = Is(), r = {
		label: "[data-sk-combobox-label]",
		hint: "[data-sk-combobox-hint]",
		error: "[data-sk-combobox-error]",
		control: "[data-sk-combobox-control]",
		value: "[data-sk-combobox-value]",
		selectedItems: "[data-sk-combobox-selected-items]",
		removeTrigger: "[data-sk-combobox-remove-trigger]",
		input: "[data-sk-combobox-input]",
		trigger: "[data-sk-combobox-trigger]",
		clear: "[data-sk-combobox-clear]",
		positioner: "[data-sk-combobox-positioner]",
		content: "[data-sk-combobox-content]",
		item: "[data-sk-combobox-item]",
		itemText: "[data-sk-combobox-item-text]",
		itemIndicator: "[data-sk-combobox-item-indicator]",
		empty: "[data-sk-combobox-empty]",
		status: "[data-sk-combobox-status]"
	}, i = /* @__PURE__ */ new Set([
		"ArrowDown",
		"ArrowUp",
		"Home",
		"End",
		"PageUp",
		"PageDown"
	]), a = /\p{M}+/gu, o = (e) => e.normalize("NFD").replace(a, "").toLocaleLowerCase(), s = (e) => {
		let t = "";
		for (let n of e.childNodes) n.nodeType === Node.TEXT_NODE ? t += n.textContent ?? "" : n.nodeType === Node.ELEMENT_NODE && n.getAttribute("aria-hidden") !== "true" && !n.hasAttribute("hidden") && (t += s(n));
		return t.trim();
	}, c = (e, t) => {
		let n = e;
		for (let [e, r] of Object.entries(t)) n = n.replace(`{${e}}`, r);
		return n;
	}, l = n.querySelector(r.label), u = n.querySelector(r.hint), d = n.querySelector(r.error), f = n.querySelector(r.control), p = n.querySelector(r.input), m = n.querySelector(r.trigger), h = n.querySelector(r.clear), g = n.querySelector(r.positioner), _ = n.querySelector(r.content), v = !!(l && f && p && m && g && _), y = n.id || Ps("sk-combobox"), b = Gs() ? Ks(y) : null, x, S = n.querySelector(r.value);
	v && p && !S && (S = document.createElement("div"), S.className = eR.value, S.setAttribute("data-sk-combobox-value", ""), p.before(S), S.append(p));
	let C = n.querySelector(r.selectedItems);
	v && n.hasAttribute("data-multiple") && !C && S && (C = document.createElement("div"), C.className = eR.selectedItems, C.setAttribute("data-sk-combobox-selected-items", ""), S.prepend(C)), C && (C.setAttribute("role", "list"), C.setAttribute("aria-label", n.dataset.selectedLabel ?? "Valores seleccionados"));
	let w = n.querySelector(r.empty);
	v && _ && !w && (w = document.createElement("div"), w.className = eR.empty, w.setAttribute("data-sk-combobox-empty", ""), w.textContent = n.dataset.emptyLabel ?? "Sin resultados", _.append(w)), w?.setAttribute("role", "presentation");
	let E = n.querySelector(r.status);
	v && f && !E && (E = document.createElement("div"), E.className = `${eR.status} sk-visually-hidden`, E.setAttribute("data-sk-combobox-status", ""), E.setAttribute("role", "status"), E.setAttribute("aria-atomic", "true"), f.after(E));
	let ee = p?.getAttribute("aria-invalid") === "true" || n.hasAttribute("data-invalid") || !!d, O = [
		p?.getAttribute("aria-describedby"),
		u ? u.id ||= `${y}:hint` : void 0,
		d ? d.id ||= `${y}:error` : void 0
	].filter(Boolean).join(" "), te = m?.getAttribute("aria-label") || n.dataset.triggerLabel || (m ? s(m) : "") || "Mostrar opciones", ne = h?.getAttribute("aria-label") || n.dataset.clearLabel || (h ? s(h) : "") || "Limpiar selección", re = (e) => {
		if (e === 0) return w?.textContent?.trim() || "Sin resultados";
		let t = e === 1 ? n.dataset.resultLabel ?? "1 resultado disponible" : n.dataset.resultsLabel ?? "{count} resultados disponibles";
		return c(t, { count: String(e) });
	}, ie = (e) => c(n.dataset.removeLabel ?? "Quitar {label}", { label: e.label }), k = Array.from(n.querySelectorAll(r.item)).map((e) => {
		let t = e.dataset.valueText ?? e.textContent?.trim() ?? "";
		return {
			node: e,
			item: {
				value: e.dataset.value ?? e.textContent?.trim() ?? "",
				label: t,
				description: e.dataset.description,
				disabled: e.hasAttribute("disabled") || e.getAttribute("aria-disabled") === "true" || e.hasAttribute("data-disabled")
			},
			key: o(t),
			text: e.querySelector(r.itemText),
			indicator: e.querySelector(r.itemIndicator)
		};
	}), ae = (e) => Ux({
		items: e,
		itemToString: (e) => e.label,
		itemToValue: (e) => e.value,
		isItemDisabled: (e) => !!e.disabled
	}), A = /* @__PURE__ */ or(k), oe = n.hasAttribute("data-multiple"), se = (e) => {
		let t = o(e.trim()), n = t ? k.filter((e) => e.key.includes(t)) : k;
		cr(A, n);
		let r = new Set(n);
		for (let e of k) {
			let t = !r.has(e);
			e.node.hidden !== t && (e.node.hidden = t);
		}
	}, ce = /* @__PURE__ */ R(() => ae(V(A).map(({ item: e }) => e))), le = tM(TS, () => ({
		id: y,
		collection: V(ce),
		name: p?.name || void 0,
		disabled: p?.disabled,
		invalid: ee,
		readOnly: p?.readOnly,
		required: p?.required,
		multiple: oe,
		openOnClick: !n.hasAttribute("data-open-on-input"),
		allowCustomValue: n.hasAttribute("data-allow-custom-value"),
		defaultValue: n.dataset.value?.split(" ").filter(Boolean),
		placeholder: p?.placeholder,
		selectionBehavior: "preserve",
		translations: {
			clearTriggerLabel: ne,
			triggerLabel: te
		},
		onInputValueChange(e) {
			se(e.reason === "input-change" ? e.inputValue : ""), n.dispatchEvent(new CustomEvent("sk-input-value-change", {
				bubbles: !0,
				detail: { inputValue: e.inputValue }
			}));
		},
		onValueChange(e) {
			n.dispatchEvent(new CustomEvent("sk-value-change", {
				bubbles: !0,
				detail: { value: e.value }
			})), queueMicrotask(() => {
				let t = oe ? "" : e.items.at(-1)?.label ?? "";
				V(j).inputValue !== t && V(j).setInputValue(t, "script");
			});
		}
	})), j = /* @__PURE__ */ R(() => fS(le, Gj)), ue = "", de = () => {
		if (!C) return;
		let e = V(j).selectedItems.map(({ value: e }) => e).join("\0");
		C.hidden = V(j).selectedItems.length === 0, e !== ue && (ue = e, C.replaceChildren(...V(j).selectedItems.map((e) => {
			let t = document.createElement("span");
			t.className = eR.selectedItem, t.setAttribute("role", "listitem");
			let n = document.createElement("span");
			n.className = eR.selectedItemLabel, n.textContent = e.label;
			let r = document.createElement("button");
			r.className = `${eR.removeTrigger} sk-button sk-interactive`, r.setAttribute("data-sk-combobox-remove-trigger", ""), r.setAttribute("data-icon-only", ""), r.setAttribute("data-size", "sm"), r.setAttribute("data-variant", "ghost"), r.dataset.value = e.value, r.type = "button", r.setAttribute("aria-label", ie(e));
			let i = document.createElement("span");
			return i.setAttribute("aria-hidden", "true"), i.textContent = "×", r.append(i), t.append(n, r), t;
		})));
	}, fe = "pointer", pe = () => {
		_ && (_.dataset.highlightSource = fe, n.toggleAttribute("data-virtual-focus", fe === "keyboard" && V(j).open && V(j).highlightedValue != null));
	}, me = null, he = /* @__PURE__ */ new Set(), ge = !1, _e = () => {
		let e = new Set(V(j).value);
		if (!ge) return ge = !0, me = V(j).highlightedValue, he = e, k;
		let t = /* @__PURE__ */ new Set();
		me !== V(j).highlightedValue && (me != null && t.add(me), V(j).highlightedValue != null && t.add(V(j).highlightedValue), me = V(j).highlightedValue);
		for (let n of e) he.has(n) || t.add(n);
		for (let n of he) e.has(n) || t.add(n);
		return he = e, t.size === 0 ? [] : k.filter((e) => t.has(e.item.value));
	};
	Wr(() => {
		if (!v || !l || !f || !p || !m || !g || !_) return;
		T(n, V(j).getRootProps()), T(l, V(j).getLabelProps()), T(f, V(j).getControlProps()), p.readOnly && f.setAttribute("data-readonly", ""), T(p, V(j).getInputProps()), O && p.setAttribute("aria-describedby", O), d && p.setAttribute("aria-errormessage", d.id), T(m, V(j).getTriggerProps()), h && (T(h, V(j).getClearTriggerProps()), h.hidden = !(V(j).hasSelectedItems || p.value.length > 0), h.tabIndex = 0);
		let e = V(j).getPositionerProps();
		T(g, b ? Js(e) : e), b && (x = qs(f, g, b)), T(_, V(j).getContentProps()), w && (w.hidden = V(A).length > 0);
		let t = V(j).open ? re(V(A).length) : "";
		E && E.textContent !== t && (E.textContent = t), de();
		for (let e of _e()) {
			let t = V(j).getItemProps({ item: e.item });
			oe || (t["aria-selected"] = e.item.value === V(j).highlightedValue ? "true" : void 0), T(e.node, t), e.text && T(e.text, V(j).getItemTextProps({ item: e.item })), e.indicator && T(e.indicator, V(j).getItemIndicatorProps({ item: e.item }));
		}
		pe();
	});
	let ve = [];
	bs(() => {
		if (!v || !p || !m || !_) return;
		ve.push(D(p, () => V(j).getInputProps())), ve.push(D(m, () => V(j).getTriggerProps())), h && ve.push(D(h, () => V(j).getClearTriggerProps())), ve.push(D(_, () => V(j).getContentProps()));
		for (let e of k) ve.push(D(e.node, () => V(j).getItemProps({ item: e.item })));
		let e = (e) => {
			i.has(e.key) && (fe = "keyboard", pe());
		}, t = () => {
			fe = "pointer", pe();
		};
		if (n.addEventListener("keydown", e, {
			capture: !0,
			passive: !0
		}), _.addEventListener("pointermove", t, {
			capture: !0,
			passive: !0
		}), ve.push(() => n.removeEventListener("keydown", e, !0), () => _.removeEventListener("pointermove", t, !0)), C) {
			let e = C, t = (t) => {
				if (!(t.target instanceof Element)) return;
				let n = t.target.closest(r.removeTrigger);
				if (!n || !e.contains(n)) return;
				let i = n.dataset.value;
				i && (V(j).clearValue(i), V(j).focus());
			};
			e.addEventListener("click", t), ve.push(() => e.removeEventListener("click", t));
		}
	}), xs(() => {
		for (let e of ve) e();
		x?.();
	}), It();
}
var rR = t((() => {
	Ts(), vs(), ec(), zj(), tR(), aM(), Cs(), k(), G();
})), iR = /* @__PURE__ */ n({ mountCombobox: () => aR }), aR, oR = t((() => {
	rR(), G(), aR = js({
		key: "combobox",
		rootSelector: "[data-sk-combobox]",
		Component: nR
	});
}));
//#endregion
//#region packages/vanilla/src/components/TreeView.svelte
function sR(e, t) {
	Ft(t, !0);
	let n = Is(), r = {
		tree: "[data-sk-tree-view-tree]",
		branch: "[data-sk-tree-view-branch]",
		branchControl: "[data-sk-tree-view-branch-control]",
		branchText: "[data-sk-tree-view-branch-text]",
		branchIndicator: "[data-sk-tree-view-branch-indicator]",
		branchContent: "[data-sk-tree-view-branch-content]",
		item: "[data-sk-tree-view-item]",
		itemText: "[data-sk-tree-view-item-text]"
	}, i = (e, t) => Array.from(e.children).find((e) => e.matches(t)) ?? null, a = (e) => e?.split(/[\s,]+/).filter(Boolean);
	function o(e, t = []) {
		return Array.from(e.children).filter((e) => e instanceof HTMLElement && (e.matches(r.branch) || e.matches(r.item))).map((e, n) => {
			let a = e.matches(r.branch), s = a ? i(e, r.branchControl) ?? void 0 : void 0, c = a ? i(e, r.branchContent) ?? void 0 : void 0, l = a ? s?.querySelector(r.branchText) ?? void 0 : e.querySelector(r.itemText) ?? void 0, u = e.dataset.value ?? `node-${[...t, n].join("-")}`, d = c ? o(c, [...t, n]) : [];
			return {
				node: {
					id: u,
					label: e.dataset.valueText ?? l?.textContent?.trim() ?? u,
					disabled: e.hasAttribute("disabled"),
					children: d.length ? d.map((e) => e.node) : void 0
				},
				element: e,
				control: s,
				text: l,
				indicator: s?.querySelector(r.branchIndicator) ?? void 0,
				content: c,
				children: d,
				indexPath: [...t, n]
			};
		});
	}
	let s = n.querySelector(r.tree), c = s ? o(s) : [], l = (e) => e.flatMap((e) => [e, ...l(e.children)]), u = l(c), d = n.id || Ps("sk-tree-view"), f = pj({
		nodeToValue: (e) => e.id,
		nodeToString: (e) => e.label,
		isNodeDisabled: (e) => !!e.disabled,
		rootNode: {
			id: "__root__",
			label: "",
			children: c.map((e) => e.node)
		}
	}), p = tM(Fj, () => ({
		id: d,
		collection: f,
		selectionMode: n.dataset.selectionMode === "multiple" ? "multiple" : "single",
		defaultExpandedValue: a(n.dataset.expandedValue),
		defaultSelectedValue: a(n.dataset.selectedValue),
		translations: { treeLabel: n.getAttribute("aria-label") ?? "Árbol" },
		onSelectionChange(e) {
			n.dispatchEvent(new CustomEvent("sk-selection-change", {
				bubbles: !0,
				detail: { selectedValue: e.selectedValue }
			}));
		},
		onExpandedChange(e) {
			n.dispatchEvent(new CustomEvent("sk-expanded-change", {
				bubbles: !0,
				detail: { expandedValue: e.expandedValue }
			}));
		}
	})), m = /* @__PURE__ */ R(() => Dj(p, Gj));
	Wr(() => {
		if (s) {
			T(n, V(m).getRootProps()), T(s, V(m).getTreeProps());
			for (let e of u) {
				let t = {
					indexPath: e.indexPath,
					node: e.node
				};
				T(e.element, e.children.length ? V(m).getBranchProps(t) : V(m).getItemProps(t)), e.children.length && e.control && e.content ? (T(e.control, V(m).getBranchControlProps(t)), T(e.content, V(m).getBranchContentProps(t)), e.text && T(e.text, V(m).getBranchTextProps(t)), e.indicator && T(e.indicator, V(m).getBranchIndicatorProps(t))) : e.text && T(e.text, V(m).getItemTextProps(t));
			}
		}
	});
	let h = [];
	bs(() => {
		if (s) {
			h.push(D(s, () => V(m).getTreeProps()));
			for (let e of u) {
				let t = e.children.length && e.control ? e.control : e.element;
				h.push(D(t, () => {
					let t = {
						indexPath: e.indexPath,
						node: e.node
					};
					return e.children.length ? V(m).getBranchControlProps(t) : V(m).getItemProps(t);
				}));
			}
		}
	}), xs(() => {
		for (let e of h) e();
	}), It();
}
var cR = t((() => {
	Ts(), vs(), zj(), aM(), Cs(), k(), G();
})), lR = /* @__PURE__ */ n({ mountTreeView: () => uR }), uR, dR = t((() => {
	cR(), G(), uR = js({
		key: "tree-view",
		rootSelector: "[data-sk-tree-view]",
		Component: sR
	});
}));
//#endregion
//#region packages/vanilla/src/components/NumberField.svelte
function fR(e, t) {
	Ft(t, !0);
	let n = Is(), r = n.querySelector("[data-sk-number-field-label]"), i = n.querySelector("[data-sk-number-field-control]"), a = n.querySelector("[data-sk-number-field-input]"), o = n.querySelector("[data-sk-number-field-decrement]"), s = n.querySelector("[data-sk-number-field-increment]"), c = n.id || Ps("sk-number-field"), l = (e) => e ? Number(e) : void 0, u = tM(oj, () => ({
		id: c,
		name: a?.name || void 0,
		locale: n.lang || document.documentElement.lang || "es",
		defaultValue: a?.defaultValue,
		min: l(a?.min),
		max: l(a?.max),
		step: l(a?.step),
		disabled: a?.disabled,
		readOnly: a?.readOnly,
		required: a?.required,
		translations: {
			decrementLabel: o?.getAttribute("aria-label") ?? "Disminuir",
			incrementLabel: s?.getAttribute("aria-label") ?? "Aumentar"
		},
		onValueChange(e) {
			n.dispatchEvent(new CustomEvent("sk-value-change", {
				bubbles: !0,
				detail: {
					value: e.value,
					valueAsNumber: e.valueAsNumber
				}
			}));
		}
	})), d = /* @__PURE__ */ R(() => TA(u, Gj));
	Wr(() => {
		!r || !i || !a || !o || !s || (T(n, V(d).getRootProps()), T(r, V(d).getLabelProps()), T(i, V(d).getControlProps()), T(a, V(d).getInputProps()), T(o, V(d).getDecrementTriggerProps()), T(s, V(d).getIncrementTriggerProps()));
	});
	let f = [];
	bs(() => {
		!a || !o || !s || (f.push(D(a, () => V(d).getInputProps())), f.push(D(o, () => V(d).getDecrementTriggerProps())), f.push(D(s, () => V(d).getIncrementTriggerProps())));
	}), xs(() => {
		for (let e of f) e();
	}), It();
}
var pR = t((() => {
	Ts(), vs(), zj(), aM(), Cs(), k(), G();
})), mR = /* @__PURE__ */ n({ mountNumberField: () => hR }), hR, gR = t((() => {
	pR(), G(), hR = js({
		key: "number-field",
		rootSelector: "[data-sk-number-field]",
		Component: fR
	});
}));
//#endregion
//#region packages/vanilla/src/components/FileUpload.svelte
function _R(e, t) {
	Ft(t, !0);
	let n = Is(), r = n.querySelector("[data-sk-file-upload-label]"), i = n.querySelector("[data-sk-file-upload-dropzone]"), a = n.querySelector("[data-sk-file-upload-input]"), o = n.querySelector("[data-sk-file-upload-trigger]"), s = n.querySelector("[data-sk-file-upload-clear]"), c = n.id || Ps("sk-file-upload"), l = a?.accept ? a.accept.split(",").map((e) => e.trim()).filter(Boolean) : void 0, u = tM(SO, () => ({
		id: c,
		name: a?.name || void 0,
		accept: l,
		disabled: a?.disabled,
		required: a?.required,
		maxFiles: Number(n.dataset.maxFiles || (a?.multiple ? Infinity : 1)),
		maxFileSize: Number(n.dataset.maxFileSize || Infinity),
		allowDrop: !n.hasAttribute("data-disable-drop"),
		directory: a?.hasAttribute("webkitdirectory"),
		onFileChange(e) {
			n.dispatchEvent(new CustomEvent("sk-file-change", {
				bubbles: !0,
				detail: {
					acceptedFiles: e.acceptedFiles,
					rejectedFiles: e.rejectedFiles
				}
			}));
		}
	})), d = /* @__PURE__ */ R(() => vO(u, Gj));
	Wr(() => {
		!r || !i || !a || !o || (T(n, V(d).getRootProps()), T(r, V(d).getLabelProps()), T(i, V(d).getDropzoneProps()), T(a, V(d).getHiddenInputProps()), T(o, V(d).getTriggerProps()), s && (T(s, V(d).getClearTriggerProps()), s.hidden = V(d).acceptedFiles.length === 0));
	});
	let f = [];
	bs(() => {
		if (!i || !a || !o) return;
		f.push(D(i, () => V(d).getDropzoneProps())), f.push(D(o, () => V(d).getTriggerProps())), s && f.push(D(s, () => V(d).getClearTriggerProps()));
		let e = () => V(d).setFiles(Array.from(a.files ?? []));
		a.addEventListener("input", e), f.push(() => a.removeEventListener("input", e));
	}), xs(() => {
		for (let e of f) e();
	}), It();
}
var vR = t((() => {
	Ts(), vs(), zj(), aM(), Cs(), k(), G();
})), yR = /* @__PURE__ */ n({ mountFileUpload: () => bR }), bR, xR = t((() => {
	vR(), G(), bR = js({
		key: "file-upload",
		rootSelector: "[data-sk-file-upload]",
		Component: _R
	});
}));
//#endregion
//#region packages/core/src/toolbar.ts
function SR(e) {
	let { key: t, currentIndex: n, itemCount: r, orientation: i, loopFocus: a } = e;
	if (r < 1) return { kind: "none" };
	let o = i === "horizontal" ? "ArrowLeft" : "ArrowUp", s = i === "horizontal" ? "ArrowRight" : "ArrowDown";
	if (![
		o,
		s,
		"Home",
		"End"
	].includes(t)) return { kind: "none" };
	let c = t === "Home" ? 0 : t === "End" ? r - 1 : n + (t === s ? 1 : -1);
	return c = a ? (c % r + r) % r : Math.max(0, Math.min(c, r - 1)), {
		kind: "move",
		index: c
	};
}
var CR = t((() => {})), wR = /* @__PURE__ */ n({ mountToolbar: () => OR });
function TR(e) {
	return e.getAttribute("tabindex") !== "-1";
}
function ER(e) {
	let t = e.dataset.orientation === "vertical" ? "vertical" : "horizontal";
	e.setAttribute("role", "toolbar"), e.setAttribute("aria-orientation", t);
	let n = (n) => {
		if (n.defaultPrevented) return;
		let r = Array.from(e.querySelectorAll(DR)).filter(TR), i = r.indexOf(document.activeElement), a = SR({
			key: n.key,
			currentIndex: i,
			itemCount: r.length,
			orientation: t,
			loopFocus: e.hasAttribute("data-loop-focus")
		});
		a.kind !== "none" && (n.preventDefault(), r[a.index]?.focus());
	};
	return e.addEventListener("keydown", n), () => e.removeEventListener("keydown", n);
}
var DR, OR, kR = t((() => {
	CR(), G(), DR = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])", OR = Ms({
		key: "toolbar",
		rootSelector: "[data-sk-toolbar]",
		connect: ER
	});
})), AR, jR = t((() => {
	AR = {
		root: "data-sk-toc",
		disclosure: "data-sk-toc-disclosure"
	}, AR.root, AR.disclosure;
})), MR = /* @__PURE__ */ n({
	connectToc: () => FR,
	mountToc: () => LR
});
function NR(e) {
	if (!e.hasAttribute("data-sk-toc-rail")) return () => {};
	let t = e.querySelector(`[${AR.disclosure}]`);
	if (!t) return () => {};
	let n = getComputedStyle(document.documentElement).getPropertyValue("--breakpoint-wide").trim() || "72rem", r = window.matchMedia(`(min-width: ${n})`), i = () => {
		t.open = r.matches;
		let e = t.querySelector("summary");
		e && (e.tabIndex = r.matches ? -1 : 0);
	};
	return i(), r.addEventListener("change", i), () => r.removeEventListener("change", i);
}
function PR(e) {
	let t = [...e.querySelectorAll("a[href^='#']")];
	if (t.length < 2) return () => {};
	let n = new Map(t.map((e) => [decodeURIComponent(e.hash.slice(1)), e])), r = [...n.keys()].map((e) => document.getElementById(e)).filter((e) => e !== null);
	if (r.length < 2) return () => {};
	let i = /* @__PURE__ */ new Set(), a = new IntersectionObserver((e) => {
		for (let t of e) t.isIntersecting ? i.add(t.target.id) : i.delete(t.target.id);
		let t = r.find((e) => i.has(e.id))?.id;
		if (t) for (let [e, r] of n) e === t ? r.setAttribute("aria-current", "location") : r.removeAttribute("aria-current");
	}, { rootMargin: "-72px 0px -70% 0px" });
	for (let e of r) a.observe(e);
	return () => a.disconnect();
}
function FR(e) {
	let t = NR(e), n = PR(e);
	return () => {
		t(), n();
	};
}
var IR, LR, RR = t((() => {
	jR(), G(), IR = `[${AR.root}]`, LR = Ms({
		key: "toc",
		rootSelector: IR,
		connect: FR
	});
}));
//#endregion
//#region packages/core/src/treegrid.ts
function zR(e) {
	let t = [], n = null;
	for (let r of e) {
		if (n !== null) {
			if (r.level > n) {
				t.push(!1);
				continue;
			}
			n = null;
		}
		t.push(!0), r.isBranch && !r.expanded && (n = r.level);
	}
	return t;
}
function BR(e, t) {
	return t.map((t, n) => {
		let r = e[n] ?? !1;
		if (t && !r) return "entering";
		if (!t && r) return "exiting";
	});
}
function VR(e) {
	let { key: t, ctrl: n, focus: r, rows: i, colCount: a } = e, o = i[r.row];
	if (!o || a < 1) return { kind: "none" };
	let s = i.length - 1, c = a - 1, l = (e) => {
		let t = i[e]?.level ?? 1;
		for (let n = e - 1; n >= 0; n--) if (i[n].level < t) return n;
		return e;
	};
	switch (t) {
		case "ArrowRight": return r.col === null ? o.isBranch && !o.expanded ? {
			kind: "toggle",
			row: r.row,
			expanded: !0
		} : {
			kind: "move",
			focus: {
				row: r.row,
				col: 0
			}
		} : r.col >= c ? { kind: "none" } : {
			kind: "move",
			focus: {
				row: r.row,
				col: r.col + 1
			}
		};
		case "ArrowLeft":
			if (r.col === null) {
				if (o.isBranch && o.expanded) return {
					kind: "toggle",
					row: r.row,
					expanded: !1
				};
				let e = l(r.row);
				return e === r.row ? { kind: "none" } : {
					kind: "move",
					focus: {
						row: e,
						col: null
					}
				};
			}
			return r.col === 0 ? {
				kind: "move",
				focus: {
					row: r.row,
					col: null
				}
			} : {
				kind: "move",
				focus: {
					row: r.row,
					col: r.col - 1
				}
			};
		case "ArrowDown": return r.row >= s ? { kind: "none" } : {
			kind: "move",
			focus: {
				row: r.row + 1,
				col: r.col
			}
		};
		case "ArrowUp": return r.row <= 0 ? { kind: "none" } : {
			kind: "move",
			focus: {
				row: r.row - 1,
				col: r.col
			}
		};
		case "Home": return n ? {
			kind: "move",
			focus: {
				row: 0,
				col: r.col
			}
		} : r.col === null ? {
			kind: "move",
			focus: {
				row: 0,
				col: null
			}
		} : {
			kind: "move",
			focus: {
				row: r.row,
				col: 0
			}
		};
		case "End": return n ? {
			kind: "move",
			focus: {
				row: s,
				col: r.col
			}
		} : r.col === null ? {
			kind: "move",
			focus: {
				row: s,
				col: null
			}
		} : {
			kind: "move",
			focus: {
				row: r.row,
				col: c
			}
		};
		case "Enter":
		case " ": return r.col === null && o.isBranch ? {
			kind: "toggle",
			row: r.row,
			expanded: !o.expanded
		} : {
			kind: "activate",
			row: r.row
		};
		default: return { kind: "none" };
	}
}
function HR(e) {
	return e < 1 ? [] : Array.from({ length: e }, (e, t) => t === 0 ? 2 : 1);
}
var UR, WR, GR = t((() => {
	JM(), UR = {
		scroll: "sk-treegrid-scroll",
		root: "sk-treegrid",
		head: "sk-treegrid__head",
		headRow: "sk-treegrid__head-row",
		columnHeader: "sk-treegrid__column-header",
		body: "sk-treegrid__body",
		row: "sk-treegrid__row",
		cell: "sk-treegrid__cell",
		disclosure: "sk-treegrid__disclosure",
		columnResizer: "sk-treegrid__column-resizer"
	}, WR = {
		expandedChange: "sk-treegrid-expanded-change",
		activate: "sk-treegrid-activate"
	};
}));
//#endregion
//#region packages/vanilla/src/splitter.ts
function KR(e) {
	let { measured: t, colCount: n, min: r, apply: i } = e, a = e.weights ?? Array.from({ length: n }, () => 1), o = e.adjustTotal ?? ((e) => e), s = !1, c = (e) => {
		let t = o(e);
		return s || t <= 0 ? !1 : (s = !0, i(KM({
			total: t,
			weights: a,
			min: r
		})), !0);
	};
	if (c(t.getBoundingClientRect().width)) return () => {};
	let l = new ResizeObserver((e) => {
		c(e[0]?.contentRect.width ?? 0) && l.disconnect();
	});
	return l.observe(t), () => l.disconnect();
}
function qR(e) {
	let { th: t, index: n, getWidths: r, setWidths: i, min: a, ariaLabel: o, direction: s, className: c, resetWidth: l } = e, u = t.ownerDocument.createElement("div");
	u.className = `${c} sk-splitter`, u.setAttribute("role", "separator"), u.setAttribute("aria-orientation", "vertical"), u.setAttribute("aria-valuemin", "0"), u.setAttribute("aria-valuemax", "100"), u.setAttribute("aria-label", o), u.setAttribute("data-sk-column-resizer", ""), u.tabIndex = 0;
	let d = () => UM(s()), f = () => {
		let e = r(), t = e[n] ?? 0, i = t + (e[n + 1] ?? 0), o = Math.max(a, i - a);
		u.setAttribute("aria-valuenow", String(HM(t, a, o)));
	}, p = (e) => {
		i(WM({
			widths: r(),
			index: n,
			delta: e,
			min: a
		})), f();
	}, m = () => {
		let e = r(), t = e[n] ?? 0, i = e[n + 1] ?? 0, a = l ? l() : (t + i) / 2;
		p(a - t);
	}, h = null, g = 0, _ = [], v = !1, y = (e) => {
		let t = e;
		t.button === 0 && (t.preventDefault(), h = t.pointerId, g = t.clientX, v = !1, u.setPointerCapture(t.pointerId));
	}, b = (e) => {
		let t = e;
		if (!(h === null || t.pointerId !== h)) {
			if (!v) {
				if (!VM(g, t.clientX)) return;
				v = !0, g = t.clientX, _ = r(), u.setAttribute("data-dragging", "");
			}
			i(WM({
				widths: _,
				index: n,
				delta: (t.clientX - g) * d(),
				min: a
			})), f();
		}
	}, x = (e) => {
		let t = e;
		h === null || t.pointerId !== h || (u.hasPointerCapture(t.pointerId) && u.releasePointerCapture(t.pointerId), h = null, v && (v = !1, u.removeAttribute("data-dragging")));
	}, S = (e) => {
		let t = e, n = BM(t);
		switch (n.kind) {
			case "delta":
				p(n.delta * d());
				break;
			case "home":
				p(-Infinity);
				break;
			case "end":
				p(Infinity);
				break;
			case "reset":
				t.preventDefault(), m();
				return;
			case "none": return;
		}
		t.preventDefault();
	};
	return u.addEventListener("pointerdown", y), u.addEventListener("pointermove", b), u.addEventListener("pointerup", x), u.addEventListener("pointercancel", x), u.addEventListener("keydown", S), u.addEventListener("dblclick", m), t.appendChild(u), f(), () => {
		u.removeEventListener("pointerdown", y), u.removeEventListener("pointermove", b), u.removeEventListener("pointerup", x), u.removeEventListener("pointercancel", x), u.removeEventListener("keydown", S), u.removeEventListener("dblclick", m), u.remove();
	};
}
function JR(e) {
	let { table: t, columnIndex: n, min: r } = e, i = Array.from(t.querySelectorAll(":scope > * > tr")).map((e) => e.children[n]).filter((e) => e instanceof HTMLTableCellElement);
	if (i.length === 0) return r;
	let a = t.ownerDocument, o = a.createElement("table");
	o.className = t.className, o.style.cssText = "position:absolute;visibility:hidden;inset-inline-start:-9999px;top:-9999px;table-layout:auto;width:auto;";
	let s = i.map((e) => {
		let t = e.cloneNode(!0);
		t.querySelectorAll("[data-sk-column-resizer]").forEach((e) => e.remove()), t.removeAttribute("id"), t.style.whiteSpace = "nowrap";
		let n = a.createElement("tr");
		return n.appendChild(t), o.appendChild(n), t;
	});
	a.body.appendChild(o);
	let c = s.reduce((e, t) => Math.max(e, t.getBoundingClientRect().width), r);
	return a.body.removeChild(o), c;
}
function YR(e, t = (e) => e.getBoundingClientRect().height) {
	let n = () => {
		e.style.setProperty("--sk-splitter-block-size", `${t(e)}px`);
	};
	n();
	let r = new ResizeObserver(n);
	return r.observe(e), () => r.disconnect();
}
var XR = t((() => {
	JM();
})), ZR = /* @__PURE__ */ n({ mountTreegrid: () => sz });
function QR(e) {
	return Array.from(e.querySelectorAll(az.row)).map((e) => ({
		element: e,
		cells: Array.from(e.querySelectorAll(":scope > td")),
		meta: {
			level: Number(e.getAttribute("aria-level")) || 1,
			isBranch: e.hasAttribute("aria-expanded"),
			expanded: e.getAttribute("aria-expanded") === "true"
		}
	}));
}
function $R(e) {
	for (let t of e) {
		let e = t.cells[0];
		if (!e || !t.meta.isBranch || e.querySelector(":scope > [data-sk-treegrid-disclosure]")) continue;
		let n = e.ownerDocument.createElement("button");
		n.type = "button", n.className = "sk-treegrid__disclosure", n.tabIndex = -1, n.setAttribute("aria-hidden", "true"), n.setAttribute("data-sk-treegrid-disclosure", ""), e.insertBefore(n, e.firstChild);
	}
}
function ez(e, t) {
	if (!(e instanceof HTMLTableElement)) return [];
	let n = t.reduce((e, t) => Math.max(e, t.cells.length), 0);
	if (e.querySelector(":scope > colgroup[data-sk-treegrid-colgroup]")?.remove(), n < 1) return [];
	let r = e.ownerDocument.createElement("colgroup");
	r.setAttribute("data-sk-treegrid-colgroup", "");
	let i = e.hasAttribute("data-resizable-columns"), a = e.parentElement instanceof HTMLElement ? e.parentElement : e, o = i ? KM({
		total: a.getBoundingClientRect().width,
		weights: tz(e, n),
		min: 60
	}) : null, s = [];
	for (let t = 0; t < n; t++) {
		let i = e.ownerDocument.createElement("col");
		i.style.width = o === null ? `${100 / n}%` : `${o[t]}px`, r.append(i), s.push(i);
	}
	return e.insertBefore(r, e.firstChild), o !== null && (e.style.width = `${o.reduce((e, t) => e + t, 0)}px`), s;
}
function tz(e, t) {
	return GM(e.getAttribute("data-column-weights"), t) ?? HR(t);
}
function nz(e, t) {
	if (!e.hasAttribute("data-resizable-columns") || t.length < 2) return () => {};
	let n = Array.from(e.querySelectorAll(":scope > thead > tr > th")), r = e.getAttribute("data-resize-label") ?? "", i = () => t.map((e) => Number.parseFloat(e.style.width) || 0), a = (e) => e.forEach((e, n) => t[n].style.width = `${e}px`), o = [];
	return n.forEach((t, s) => {
		if (s >= n.length - 1 || t.querySelector(":scope > [data-sk-column-resizer]")) return;
		let c = t.textContent?.trim() ?? "";
		o.push(qR({
			th: t,
			index: s,
			getWidths: i,
			setWidths: a,
			min: 60,
			ariaLabel: r ? `${r}: ${c}` : c,
			direction: () => getComputedStyle(e).direction === "rtl" ? "rtl" : "ltr",
			className: UR.columnResizer
		}));
	}), () => o.forEach((e) => e());
}
function rz(e, t) {
	return !e.hasAttribute("data-resizable-columns") || t.length < 1 ? () => {} : KR({
		measured: e.parentElement instanceof HTMLElement ? e.parentElement : e,
		colCount: t.length,
		min: 60,
		weights: tz(e, t.length),
		apply: (n) => {
			t.forEach((e, t) => e.style.width = `${n[t]}px`), e.style.width = `${n.reduce((e, t) => e + t, 0)}px`;
		}
	});
}
function iz(e) {
	let t = QR(e);
	$R(t);
	let n = ez(e, t), r = rz(e, n), i = nz(e, n), a = [], o = null, s = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map(), l = (e, t) => {
		let n = c.get(e);
		n && clearTimeout(n);
		let r = !1, i = () => {
			r || (r = !0, c.delete(e), e.element.removeEventListener("animationend", a), e.element.removeAttribute("data-state"), t === "exiting" && (e.element.hidden = !0, s.delete(e)));
		}, a = () => i();
		e.element.addEventListener("animationend", a, { once: !0 }), c.set(e, setTimeout(i, 400));
	}, u = () => {
		let e = zR(t.map((e) => e.meta)), n = o === null ? null : BR(o, e);
		o = e, t.forEach((t, r) => {
			let i = n?.[r];
			i === "entering" ? (t.element.hidden = !1, t.element.setAttribute("data-state", "entering"), l(t, "entering")) : i === "exiting" ? (s.add(t), t.element.setAttribute("data-state", "exiting"), l(t, "exiting")) : s.has(t) || (t.element.hidden = !e[r]);
		}), a = t.filter((t, n) => e[n]);
	}, d = () => {
		let t = e.ownerDocument?.activeElement;
		for (let e = 0; e < a.length; e++) {
			let n = a[e];
			if (n.element === t) return {
				row: e,
				col: null
			};
			let r = n.cells.indexOf(t);
			if (r !== -1) return {
				row: e,
				col: r
			};
		}
		for (let e = 0; e < a.length; e++) {
			let t = a[e];
			if (t.element.tabIndex === 0) return {
				row: e,
				col: null
			};
			let n = t.cells.findIndex((e) => e.tabIndex === 0);
			if (n !== -1) return {
				row: e,
				col: n
			};
		}
		return {
			row: 0,
			col: null
		};
	}, f = (e) => {
		let t = a[e.row];
		if (t) return { element: e.col === null ? t.element : t.cells[e.col] ?? t.element };
	}, p = (e) => {
		for (let e of a) {
			e.element.tabIndex = -1;
			for (let t of e.cells) t.tabIndex = -1;
		}
		let t = f(e);
		t && (t.element.tabIndex = 0);
	}, m = (e) => {
		p(e), f(e)?.element.focus();
	}, h = (t, n) => {
		let r = a[t];
		r && (r.element.setAttribute("aria-expanded", String(n)), r.meta = {
			...r.meta,
			expanded: n
		}, u(), p({
			row: t,
			col: null
		}), r.element.focus(), oz(e, WR.expandedChange, {
			value: r.element.getAttribute("data-value"),
			expanded: n
		}));
	}, g = (t) => {
		if (t.defaultPrevented || !a.length) return;
		let n = d(), r = VR({
			key: t.key,
			ctrl: t.ctrlKey || t.metaKey,
			focus: n,
			rows: a.map((e) => e.meta),
			colCount: a[n.row]?.cells.length ?? 0
		});
		if (r.kind !== "none") {
			if (t.preventDefault(), r.kind === "move") m(r.focus);
			else if (r.kind === "toggle") h(r.row, r.expanded);
			else if (r.kind === "activate") {
				let t = a[r.row];
				t && oz(e, WR.activate, { value: t.element.getAttribute("data-value") });
			}
		}
	}, _ = (t) => {
		let n = t.target.closest(az.row);
		if (!n || !e.contains(n)) return;
		let r = a.findIndex((e) => e.element === n);
		if (r === -1) return;
		let i = a[r], o = t.target.closest("td"), s = o ? i.cells.indexOf(o) : -1;
		if (s === 0 && i.meta.isBranch) {
			m({
				row: r,
				col: null
			}), h(r, !i.meta.expanded);
			return;
		}
		m({
			row: r,
			col: s === -1 ? null : s
		});
	};
	return u(), p({
		row: 0,
		col: null
	}), e.addEventListener("keydown", g), e.addEventListener("click", _), () => {
		e.removeEventListener("keydown", g), e.removeEventListener("click", _), r(), i();
		for (let e of c.values()) clearTimeout(e);
		c.clear();
	};
}
var az, oz, sz, cz = t((() => {
	GR(), JM(), G(), XR(), az = {
		root: "[data-sk-treegrid]",
		row: "[data-sk-treegrid-row]"
	}, oz = (e, t, n) => e.dispatchEvent(new CustomEvent(t, {
		bubbles: !0,
		detail: n
	})), sz = Ms({
		key: "treegrid",
		rootSelector: az.root,
		connect: iz
	});
})), lz, uz = t((() => {
	lz = {
		scroll: "sk-table-scroll",
		root: "sk-table",
		caption: "sk-table__caption",
		head: "sk-table__head",
		foot: "sk-table__foot",
		body: "sk-table__body",
		row: "sk-table__row",
		header: "sk-table__header",
		cell: "sk-table__cell",
		columnResizer: "sk-table__column-resizer"
	};
})), dz = /* @__PURE__ */ n({ mountTable: () => mz });
function fz(e) {
	if (!(e instanceof HTMLTableElement)) return () => {};
	let t = Array.from(e.querySelectorAll(":scope > thead > tr > th")), n = t.length;
	if (n < 2) return () => {};
	e.querySelector(":scope > colgroup[data-sk-table-colgroup]")?.remove();
	let r = e.ownerDocument.createElement("colgroup");
	r.setAttribute("data-sk-table-colgroup", "");
	let i = e.parentElement instanceof HTMLElement ? e.parentElement : e, a = GM(e.getAttribute("data-column-weights"), n) ?? Array.from({ length: n }, () => 1), o = (() => {
		let t = getComputedStyle(e);
		return (Number.parseFloat(t.borderLeftWidth) || 0) + (Number.parseFloat(t.borderRightWidth) || 0);
	})(), s = (e) => Math.max(0, e - o), c = KM({
		total: s(i.getBoundingClientRect().width),
		weights: a,
		min: 60
	}), l = [];
	for (let t = 0; t < n; t++) {
		let n = e.ownerDocument.createElement("col");
		n.style.width = `${c[t]}px`, r.append(n), l.push(n);
	}
	e.insertBefore(r, e.firstChild), e.style.width = `${c.reduce((e, t) => e + t, 0)}px`;
	let u = KR({
		measured: i,
		colCount: n,
		min: 60,
		weights: a,
		adjustTotal: s,
		apply: (t) => {
			l.forEach((e, n) => e.style.width = `${t[n]}px`), e.style.width = `${t.reduce((e, t) => e + t, 0)}px`;
		}
	}), d = e.getAttribute("data-resize-label") ?? "", f = () => l.map((e) => Number.parseFloat(e.style.width) || 0), p = (e) => e.forEach((e, t) => l[t].style.width = `${e}px`), m = [u, YR(e, (e) => {
		let t = e.querySelector(":scope > * > tr");
		return t instanceof HTMLElement ? e.getBoundingClientRect().bottom - t.getBoundingClientRect().top : e.getBoundingClientRect().height;
	})];
	return t.forEach((n, r) => {
		if (r >= t.length - 1 || n.querySelector(":scope > [data-sk-column-resizer]")) return;
		let i = n.textContent?.trim() ?? "";
		m.push(qR({
			th: n,
			index: r,
			getWidths: f,
			setWidths: p,
			min: 60,
			ariaLabel: d ? `${d}: ${i}` : i,
			direction: () => getComputedStyle(e).direction === "rtl" ? "rtl" : "ltr",
			className: lz.columnResizer,
			resetWidth: () => JR({
				table: e,
				columnIndex: r,
				min: 60
			})
		}));
	}), () => m.forEach((e) => e());
}
var pz, mz, hz = t((() => {
	uz(), JM(), G(), XR(), pz = "table.sk-table[data-resizable-columns]:not([data-sk-treegrid])", mz = Ms({
		key: "table",
		rootSelector: pz,
		connect: fz
	});
})), gz = /* @__PURE__ */ n({
	connectSliderRange: () => _z,
	mountSliderRange: () => yz
});
function _z(e) {
	let t = e.querySelector(vz.low), n = e.querySelector(vz.high), r = e.querySelector(vz.fill);
	if (!t || !n) return () => {};
	let i = (e, t) => {
		let n = Number(e);
		return e === "" || !Number.isFinite(n) ? t : n;
	}, a = i(t.min || n.min, 0), o = i(t.max || n.max, 100), s = () => {
		let { low: e, high: i } = jN(Number(t.value), Number(n.value)), s = AN(e, i, a, o);
		t.min = String(s.lowMin), t.max = String(s.lowMax), n.min = String(s.highMin), n.max = String(s.highMax), r?.style.setProperty("--sk-slider-range-fill-start", String(kN(e, a, o))), r?.style.setProperty("--sk-slider-range-fill-end", String(kN(i, a, o)));
	};
	s();
	let c = [S(t, { input: s }), S(n, { input: s })];
	return () => {
		for (let e of c) e();
	};
}
var vz, yz, bz = t((() => {
	PN(), k(), G(), vz = {
		root: "[data-sk-slider-range]",
		low: "[data-sk-slider-range-low]",
		high: "[data-sk-slider-range-high]",
		fill: "[data-sk-slider-range-fill]"
	}, yz = Ms({
		key: "slider-range",
		rootSelector: vz.root,
		connect: _z
	});
}));
//#endregion
//#region packages/core/src/data-grid.ts
function xz(e) {
	let { key: t, ctrl: n, focus: r, rowCount: i, colCountOf: a, wrapRows: o, wrapCols: s } = e;
	if (i < 1) return { kind: "none" };
	let c = a(r.row);
	if (c < 1) return { kind: "none" };
	let l = i - 1, u = c - 1, d = (e, t) => Math.max(0, Math.min(t, a(e) - 1));
	switch (t) {
		case "ArrowRight": return r.col < u ? {
			kind: "move",
			focus: {
				row: r.row,
				col: r.col + 1
			}
		} : s ? {
			kind: "move",
			focus: {
				row: r.row < l ? r.row + 1 : 0,
				col: 0
			}
		} : { kind: "none" };
		case "ArrowLeft": {
			if (r.col > 0) return {
				kind: "move",
				focus: {
					row: r.row,
					col: r.col - 1
				}
			};
			if (!s) return { kind: "none" };
			let e = r.row > 0 ? r.row - 1 : l;
			return {
				kind: "move",
				focus: {
					row: e,
					col: a(e) - 1
				}
			};
		}
		case "ArrowDown": return r.row < l ? {
			kind: "move",
			focus: {
				row: r.row + 1,
				col: d(r.row + 1, r.col)
			}
		} : o ? {
			kind: "move",
			focus: {
				row: 0,
				col: d(0, r.col)
			}
		} : { kind: "none" };
		case "ArrowUp": return r.row > 0 ? {
			kind: "move",
			focus: {
				row: r.row - 1,
				col: d(r.row - 1, r.col)
			}
		} : o ? {
			kind: "move",
			focus: {
				row: l,
				col: d(l, r.col)
			}
		} : { kind: "none" };
		case "Home": return n ? {
			kind: "move",
			focus: {
				row: 0,
				col: 0
			}
		} : r.col === 0 ? { kind: "none" } : {
			kind: "move",
			focus: {
				row: r.row,
				col: 0
			}
		};
		case "End": return n ? {
			kind: "move",
			focus: {
				row: l,
				col: a(l) - 1
			}
		} : r.col === u ? { kind: "none" } : {
			kind: "move",
			focus: {
				row: r.row,
				col: u
			}
		};
		default: return { kind: "none" };
	}
}
var Sz = t((() => {})), Cz = /* @__PURE__ */ n({ mountDataGrid: () => Dz });
function wz(e) {
	return Array.from(e.querySelectorAll(Ez.row)).map((e) => Array.from(e.querySelectorAll(Ez.cell)).map((e) => ({
		cell: e,
		target: e.querySelector("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])") ?? e
	})));
}
function Tz(e) {
	let t = wz(e), n = t.length, r = (e) => t[e]?.length ?? 0, i = e.hasAttribute("data-wrap-rows"), a = e.hasAttribute("data-wrap-cols"), o = (e, n) => t[e]?.[n], s = (e) => {
		for (let e of t) for (let t of e) t.target.tabIndex = -1;
		let n = o(e.row, e.col);
		n && (n.target.tabIndex = 0);
	}, c = () => {
		let n = e.ownerDocument?.activeElement;
		for (let e = 0; e < t.length; e++) {
			let r = t[e].findIndex((e) => e.target === n);
			if (r !== -1) return {
				row: e,
				col: r
			};
		}
		for (let e = 0; e < t.length; e++) {
			let n = t[e].findIndex((e) => e.target.tabIndex === 0);
			if (n !== -1) return {
				row: e,
				col: n
			};
		}
		return {
			row: 0,
			col: 0
		};
	}, l = (e) => {
		s(e), o(e.row, e.col)?.target.focus();
	}, u = (e) => {
		if (e.defaultPrevented || !n) return;
		let t = c(), o = xz({
			key: e.key,
			ctrl: e.ctrlKey || e.metaKey,
			focus: t,
			rowCount: n,
			colCountOf: r,
			wrapRows: i,
			wrapCols: a
		});
		o.kind !== "none" && (e.preventDefault(), l(o.focus));
	}, d = (e) => {
		let n = e.target;
		for (let e = 0; e < t.length; e++) {
			let r = t[e].findIndex((e) => e.cell.contains(n));
			if (r !== -1) {
				l({
					row: e,
					col: r
				});
				return;
			}
		}
	};
	return s({
		row: 0,
		col: 0
	}), e.addEventListener("keydown", u), e.addEventListener("click", d), () => {
		e.removeEventListener("keydown", u), e.removeEventListener("click", d);
	};
}
var Ez, Dz, Oz = t((() => {
	Sz(), G(), Ez = {
		root: "[data-sk-data-grid]",
		row: "[role=\"row\"]",
		cell: "[role=\"gridcell\"]"
	}, Dz = Ms({
		key: "data-grid",
		rootSelector: Ez.root,
		connect: Tz
	});
})), kz = /* @__PURE__ */ n({ mountNavListGroup: () => Mz });
function Az(e) {
	let t = e.parentElement, n = t?.querySelector(jz.list);
	if (!t || !n) return () => {};
	let r = n.id || Ps("sk-nav-list-group");
	n.id = r, e.setAttribute("aria-controls", r);
	let i = () => e.getAttribute("aria-expanded") === "true", a = () => {
		n.hidden = !i();
	}, o = (t) => {
		e.setAttribute("aria-expanded", String(t)), a();
	}, s = () => o(!i()), c = (t) => {
		t.key !== "Escape" || !i() || (t.preventDefault(), o(!1), e.focus());
	};
	return a(), e.addEventListener("click", s), t.addEventListener("keydown", c), () => {
		e.removeEventListener("click", s), t.removeEventListener("keydown", c);
	};
}
var jz, Mz, Nz = t((() => {
	G(), jz = {
		trigger: "[data-sk-nav-list-group-trigger]",
		list: "[data-sk-nav-list-group-list]"
	}, Mz = Ms({
		key: "nav-list-group",
		rootSelector: jz.trigger,
		connect: Az
	});
}));
//#endregion
//#region packages/core/src/menubar.ts
function Pz(e) {
	let { key: t, focus: n, topCount: r, hasMenuAt: i, subCountOf: a } = e;
	if (r < 1) return { kind: "none" };
	let o = r - 1, s = n.subIndex !== null, c = i(n.topIndex), l = a(n.topIndex);
	switch (t) {
		case "ArrowRight": return {
			kind: "moveTop",
			topIndex: n.topIndex < o ? n.topIndex + 1 : 0,
			keepOpen: s
		};
		case "ArrowLeft": return {
			kind: "moveTop",
			topIndex: n.topIndex > 0 ? n.topIndex - 1 : o,
			keepOpen: s
		};
		case "ArrowDown": {
			if (!c) return { kind: "none" };
			if (!s) return {
				kind: "open",
				topIndex: n.topIndex,
				focusLast: !1
			};
			if (l < 1) return { kind: "none" };
			let e = n.subIndex === null ? 0 : (n.subIndex + 1) % l;
			return {
				kind: "move",
				focus: {
					topIndex: n.topIndex,
					subIndex: e
				}
			};
		}
		case "ArrowUp": {
			if (!c) return { kind: "none" };
			if (!s) return {
				kind: "open",
				topIndex: n.topIndex,
				focusLast: !0
			};
			if (l < 1) return { kind: "none" };
			let e = n.subIndex === null ? l - 1 : (n.subIndex - 1 + l) % l;
			return {
				kind: "move",
				focus: {
					topIndex: n.topIndex,
					subIndex: e
				}
			};
		}
		case "Enter":
		case " ": return c && !s ? {
			kind: "open",
			topIndex: n.topIndex,
			focusLast: !1
		} : { kind: "none" };
		case "Escape": return s ? { kind: "close" } : { kind: "none" };
		case "Home": return s ? l < 1 ? { kind: "none" } : {
			kind: "move",
			focus: {
				topIndex: n.topIndex,
				subIndex: 0
			}
		} : {
			kind: "moveTop",
			topIndex: 0,
			keepOpen: !1
		};
		case "End": return s ? l < 1 ? { kind: "none" } : {
			kind: "move",
			focus: {
				topIndex: n.topIndex,
				subIndex: l - 1
			}
		} : {
			kind: "moveTop",
			topIndex: o,
			keepOpen: !1
		};
		default: return { kind: "none" };
	}
}
var Fz = t((() => {
	LL(), NL.root, PL.root, PL.trigger, PL.trigger, { ...IL };
})), Iz = /* @__PURE__ */ n({ mountMenubar: () => Hz });
function Lz(e) {
	return Array.from(e.querySelectorAll(Vz.trigger)).filter((t) => t.closest(Vz.root) === e).map((e) => ({
		trigger: e,
		wrapper: e.closest(Vz.wrapper) ?? e
	}));
}
function Rz(e) {
	return Array.from(e.querySelectorAll(Vz.content)).find((t) => t.closest(Vz.wrapper) === e) ?? null;
}
function zz(e) {
	let t = Rz(e);
	return t ? Array.from(t.querySelectorAll(Vz.item)).filter((t) => t.closest(Vz.wrapper) === e).length : 0;
}
function Bz(e) {
	let t = Lz(e);
	if (!t.length) return () => {};
	let n = (e) => Rz(t[e].wrapper) !== null, r = (e) => zz(t[e].wrapper), i = (e) => qL(t[e].wrapper)?.open ?? !1, a = () => t.findIndex((e, t) => i(t)), o = () => {
		let n = e.ownerDocument?.activeElement;
		for (let e = 0; e < t.length; e++) {
			let r = t[e];
			if (r.trigger === n) return {
				topIndex: e,
				subIndex: null
			};
			if (n && Rz(r.wrapper) === n) return {
				topIndex: e,
				subIndex: 0
			};
		}
		let r = a();
		if (r !== -1) return {
			topIndex: r,
			subIndex: 0
		};
		for (let e = 0; e < t.length; e++) if (t[e].trigger.tabIndex === 0) return {
			topIndex: e,
			subIndex: null
		};
		return {
			topIndex: 0,
			subIndex: null
		};
	}, s = (e) => {
		for (let e of t) e.trigger.tabIndex = -1;
		let n = t[e.topIndex];
		n && (n.trigger.tabIndex = 0);
	}, c = (e) => {
		t.forEach((t, n) => {
			n !== e && qL(t.wrapper)?.setOpen(!1);
		});
	}, l = (e) => {
		s(e);
		let n = t[e.topIndex];
		n && e.subIndex === null && n.trigger.focus();
	}, u = (e) => {
		if (e.defaultPrevented || ![
			"ArrowLeft",
			"ArrowRight",
			"Home",
			"End"
		].includes(e.key) || e.target.closest(Vz.submenu)) return;
		let i = o(), a = i.subIndex !== null;
		if ((e.key === "Home" || e.key === "End") && a) return;
		let u = Pz({
			key: e.key,
			focus: i,
			topCount: t.length,
			hasMenuAt: n,
			subCountOf: r
		});
		u.kind !== "none" && (e.preventDefault(), e.stopPropagation(), u.kind === "moveTop" ? u.keepOpen && n(u.topIndex) ? (c(u.topIndex), qL(t[u.topIndex].wrapper)?.setOpen(!0), s({
			topIndex: u.topIndex,
			subIndex: null
		})) : (u.keepOpen && c(), l({
			topIndex: u.topIndex,
			subIndex: null
		})) : u.kind === "move" && l(u.focus));
	}, d = (e) => {
		let n = e.target, r = t.findIndex((e) => e.trigger === n || e.trigger.contains(n));
		r !== -1 && c(r);
	}, f = () => s(o());
	return s({
		topIndex: 0,
		subIndex: null
	}), e.addEventListener("keydown", u, { capture: !0 }), e.addEventListener("click", d), e.addEventListener("focusin", f), () => {
		e.removeEventListener("keydown", u, { capture: !0 }), e.removeEventListener("click", d), e.removeEventListener("focusin", f);
	};
}
var Vz, Hz, Uz = t((() => {
	Fz(), XL(), G(), Vz = {
		root: "[data-sk-menubar]",
		trigger: "[data-sk-menubar-item]",
		wrapper: "[data-sk-menu]",
		content: "[data-sk-menu-content]",
		item: "[data-sk-menu-item]",
		submenu: "[data-sk-submenu]"
	}, Hz = Ms({
		key: "menubar",
		rootSelector: Vz.root,
		connect: Bz
	});
}));
//#endregion
//#region packages/core/src/meter.ts
function Wz(e, t, n) {
	return !Number.isFinite(e) || !Number.isFinite(t) || !Number.isFinite(n) || n <= t ? 0 : Math.min(Math.max((e - t) / (n - t), 0), 1);
}
var Gz = t((() => {})), Kz = /* @__PURE__ */ n({
	connectMeter: () => qz,
	mountMeter: () => Yz
});
function qz(e) {
	let t = Number(e.getAttribute("aria-valuenow")), n = Number(e.getAttribute("aria-valuemin") ?? 0), r = Number(e.getAttribute("aria-valuemax") ?? 100);
	return e.style.setProperty("--sk-meter-fill", `${Wz(t, n, r) * 100}%`), () => {
		e.style.removeProperty("--sk-meter-fill");
	};
}
var Jz, Yz, Xz = t((() => {
	Gz(), G(), Jz = "[data-sk-meter]", Yz = Ms({
		key: "meter",
		rootSelector: Jz,
		connect: qz
	});
}));
//#endregion
//#region packages/core/src/breadcrumb.ts
function Zz(e) {
	return e < 4 ? null : {
		start: 1,
		end: e - 2
	};
}
var Qz, $z = t((() => {
	Qz = {
		root: "sk-breadcrumb",
		list: "sk-breadcrumb__list",
		item: "sk-breadcrumb__item",
		link: "sk-breadcrumb__link",
		current: "sk-breadcrumb__current",
		separator: "sk-breadcrumb__separator",
		collapseTrigger: "sk-breadcrumb__collapse-trigger",
		collapsePanel: "sk-breadcrumb__collapse-panel"
	};
})), eB = /* @__PURE__ */ n({
	connectBreadcrumb: () => tB,
	mountBreadcrumb: () => iB
});
function tB(e) {
	let t = e.querySelector(`.${Qz.list}`);
	if (!t) return () => {};
	let n = Array.from(t.querySelectorAll(rB)), r = Zz(n.length);
	if (!r) return () => {};
	let i = n.slice(r.start, r.end + 1), a = n[0], o = a.querySelector(`.${Qz.separator}`), s = t.cloneNode(!0);
	s.setAttribute("aria-hidden", "true"), s.style.position = "absolute", s.style.visibility = "hidden", s.style.insetInlineStart = "0", s.style.insetBlockStart = "0", s.style.inlineSize = "max-content", s.style.pointerEvents = "none", e.append(s);
	let c = e.getAttribute("data-collapsed-label") ?? "Mostrar niveles ocultos", l = Ps("sk-breadcrumb-collapse"), u = document.createElement("li");
	u.className = `${Qz.item} sk-breadcrumb__item--collapse`, u.hidden = !0;
	let d = document.createElement("button");
	d.type = "button", d.className = `${Qz.collapseTrigger} ${Zs.anchor}`, d.setAttribute("aria-label", c), d.setAttribute("popovertarget", l), d.textContent = "…";
	let f = document.createElement("ol");
	f.className = `${Qz.collapsePanel} ${Zs.positioner}`, f.id = l, f.setAttribute("popover", "auto"), f.setAttribute("role", "list"), f.setAttribute("data-sk-placement", "block-end"), u.append(d, f), o && u.append(o.cloneNode(!0)), a.after(u);
	let p = () => {
		for (let e of i) u.before(e);
		u.hidden = !0;
	}, m = () => {
		for (let e of i) f.append(e);
		u.hidden = !1;
	}, h = () => {
		s.scrollWidth > e.clientWidth ? m() : p();
	};
	e.setAttribute("data-sk-breadcrumb-ready", ""), h();
	let g = typeof ResizeObserver > "u" ? void 0 : new ResizeObserver(h);
	return g?.observe(e), () => {
		g?.disconnect(), p(), u.remove(), s.remove(), e.removeAttribute("data-sk-breadcrumb-ready");
	};
}
var nB, rB, iB, aB = t((() => {
	ec(), $z(), G(), nB = "[data-sk-breadcrumb]", rB = `:scope > .${Qz.item}`, iB = Ms({
		key: "breadcrumb",
		rootSelector: nB,
		connect: tB
	});
})), oB = [
	{
		selector: "[data-sk-button]",
		load: async () => (await Promise.resolve().then(() => (Ws(), Bs))).mountButton
	},
	{
		selector: "[data-sk-select]",
		load: async () => (await Promise.resolve().then(() => (uM(), cM))).mountSelect
	},
	{
		selector: "[data-sk-segmented]",
		load: async () => (await Promise.resolve().then(() => (SM(), pM))).mountSegmented
	},
	{
		selector: "[data-sk-stat][data-animate]",
		load: async () => (await Promise.resolve().then(() => (zM(), PM))).mountStat
	},
	{
		selector: "[data-sk-sidebar]",
		load: async () => (await Promise.resolve().then(() => (ON(), yN))).mountSidebar
	},
	{
		selector: "[data-sk-slider]",
		load: async () => (await Promise.resolve().then(() => (zN(), FN))).mountSlider
	},
	{
		selector: "[data-sk-toast]",
		load: async () => (await Promise.resolve().then(() => (rP(), JN))).mountToast
	},
	{
		selector: "[data-sk-vaul], [data-sk-dialog-vaul]",
		load: async () => (await Promise.resolve().then(() => (pP(), uP))).mountVaul
	},
	{
		selector: "[data-sk-tabs]",
		load: async () => (await Promise.resolve().then(() => (vP(), gP))).mountTabs
	},
	{
		selector: "[data-sk-carousel]",
		load: async () => (await Promise.resolve().then(() => (kP(), DP))).mountCarousel
	},
	{
		selector: "[data-sk-accordion]",
		load: async () => (await Promise.resolve().then(() => (WP(), HP))).mountAccordion
	},
	{
		selector: "[data-sk-expandable-tile]",
		load: async () => (await Promise.resolve().then(() => (YP(), qP))).mountExpandableTile
	},
	{
		selector: "[data-sk-checkbox-group]",
		load: async () => (await Promise.resolve().then(() => (cF(), $P))).mountCheckboxGroup
	},
	{
		selector: "[data-sk-tile-checkbox]",
		load: async () => (await Promise.resolve().then(() => (pF(), dF))).mountTileCheckbox
	},
	{
		selector: "[data-sk-tile-switch]",
		load: async () => (await Promise.resolve().then(() => (vF(), gF))).mountTileSwitch
	},
	{
		selector: "[data-sk-tile-radio-group]",
		load: async () => (await Promise.resolve().then(() => (CF(), xF))).mountTileRadioGroup
	},
	{
		selector: "[data-sk-table-pager]",
		load: async () => (await Promise.resolve().then(() => (zF(), OF))).mountTablePager
	},
	{
		selector: "[data-sk-command-palette]",
		load: async () => (await Promise.resolve().then(() => (fI(), iI))).mountCommandPalette
	},
	{
		selector: "[data-sk-date-picker]",
		load: async () => (await Promise.resolve().then(() => (HI(), BI))).mountDatePicker
	},
	{
		selector: "[data-sk-time-field]",
		load: async () => (await Promise.resolve().then(() => (_L(), hL))).mountTimeField
	},
	{
		selector: "[data-sk-calendar]",
		load: async () => (await Promise.resolve().then(() => (SL(), bL))).mountCalendar
	},
	{
		selector: "[data-sk-anchor]",
		load: async () => (await Promise.resolve().then(() => (jL(), kL))).mountTooltip
	},
	{
		selector: "[data-sk-menu]",
		load: async () => (await Promise.resolve().then(() => ($L(), ZL))).mountMenu
	},
	{
		selector: "[data-sk-combobox]",
		load: async () => (await Promise.resolve().then(() => (oR(), iR))).mountCombobox
	},
	{
		selector: "[data-sk-tree-view]",
		load: async () => (await Promise.resolve().then(() => (dR(), lR))).mountTreeView
	},
	{
		selector: "[data-sk-number-field]",
		load: async () => (await Promise.resolve().then(() => (gR(), mR))).mountNumberField
	},
	{
		selector: "[data-sk-file-upload]",
		load: async () => (await Promise.resolve().then(() => (xR(), yR))).mountFileUpload
	},
	{
		selector: "[data-sk-toolbar]",
		load: async () => (await Promise.resolve().then(() => (kR(), wR))).mountToolbar
	},
	{
		selector: "[data-sk-toc]",
		load: async () => (await Promise.resolve().then(() => (RR(), MR))).mountToc
	},
	{
		selector: "[data-sk-treegrid]",
		load: async () => (await Promise.resolve().then(() => (cz(), ZR))).mountTreegrid
	},
	{
		selector: "table.sk-table[data-resizable-columns]:not([data-sk-treegrid])",
		load: async () => (await Promise.resolve().then(() => (hz(), dz))).mountTable
	},
	{
		selector: "[data-sk-slider-range]",
		load: async () => (await Promise.resolve().then(() => (bz(), gz))).mountSliderRange
	},
	{
		selector: "[data-sk-data-grid]",
		load: async () => (await Promise.resolve().then(() => (Oz(), Cz))).mountDataGrid
	},
	{
		selector: "[data-sk-nav-list-group-trigger]",
		load: async () => (await Promise.resolve().then(() => (Nz(), kz))).mountNavListGroup
	},
	{
		selector: "[data-sk-menubar]",
		load: async () => (await Promise.resolve().then(() => (Uz(), Iz))).mountMenubar
	},
	{
		selector: "[data-sk-meter]",
		load: async () => (await Promise.resolve().then(() => (Xz(), Kz))).mountMeter
	},
	{
		selector: "[data-sk-breadcrumb]",
		load: async () => (await Promise.resolve().then(() => (aB(), eB))).mountBreadcrumb
	}
];
function sB(e, t) {
	return typeof Element < "u" && e instanceof Element && e.matches(t) || e.querySelector(t) !== null;
}
async function cB(e) {
	let t = e ?? (typeof document > "u" ? void 0 : document);
	if (!t) return 0;
	let n = oB.filter(({ selector: e }) => sB(t, e)), r = await Promise.all(n.map(({ load: e }) => e())), i = 0;
	for (let e of r) i += e(t);
	return i;
}
//#endregion
//#region packages/vanilla/src/runtime.ts
G();
//#endregion
//#region packages/icons-phosphor/src/generated/set.ts
var $ = { fill: "currentColor" }, lB = {
	"chevron-up": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z\"/>"
	},
	"chevron-down": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z\"/>"
	},
	"chevron-left": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z\"/>"
	},
	"chevron-right": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z\"/>"
	},
	"arrow-up": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z\"/>"
	},
	"arrow-down": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z\"/>"
	},
	"arrow-left": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z\"/>"
	},
	"arrow-right": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z\"/>"
	},
	"external-link": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z\"/>"
	},
	add: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z\"/>"
	},
	remove: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z\"/>"
	},
	close: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z\"/>"
	},
	check: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z\"/>"
	},
	search: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z\"/>"
	},
	edit: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z\"/>"
	},
	delete: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z\"/>"
	},
	copy: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z\"/>"
	},
	filter: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z\"/>"
	},
	refresh: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z\"/>"
	},
	more: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z\"/>"
	},
	menu: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z\"/>"
	},
	info: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z\"/>"
	},
	success: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z\"/>"
	},
	warning: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z\"/>"
	},
	danger: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z\"/>"
	},
	calendar: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z\"/>"
	},
	clock: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z\"/>"
	},
	upload: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H80a8,8,0,0,1,0,16H32v64H224V136H176a8,8,0,0,1,0-16h48A16,16,0,0,1,240,136ZM85.66,77.66,120,43.31V128a8,8,0,0,0,16,0V43.31l34.34,34.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,77.66ZM200,168a12,12,0,1,0-12,12A12,12,0,0,0,200,168Z\"/>"
	},
	download: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H72a8,8,0,0,1,0,16H32v64H224V136H184a8,8,0,0,1,0-16h40A16,16,0,0,1,240,136Zm-117.66-2.34a8,8,0,0,0,11.32,0l48-48a8,8,0,0,0-11.32-11.32L136,108.69V24a8,8,0,0,0-16,0v84.69L85.66,74.34A8,8,0,0,0,74.34,85.66ZM200,168a12,12,0,1,0-12,12A12,12,0,0,0,200,168Z\"/>"
	},
	file: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z\"/>"
	},
	folder: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M216,72H131.31L104,44.69A15.86,15.86,0,0,0,92.69,40H40A16,16,0,0,0,24,56V200.62A15.4,15.4,0,0,0,39.38,216H216.89A15.13,15.13,0,0,0,232,200.89V88A16,16,0,0,0,216,72ZM40,56H92.69l16,16H40ZM216,200H40V88H216Z\"/>"
	},
	settings: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z\"/>"
	},
	user: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z\"/>"
	},
	visibility: {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z\"/>"
	},
	"visibility-off": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.67,45.85a32,32,0,0,1-41.67-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.73,16.2A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,1,1,106,49.79,134,134,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z\"/>"
	},
	"mode-system": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z\"/>"
	},
	"mode-light": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z\"/>"
	},
	"mode-dark": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z\"/>"
	},
	"screen-desktop": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z\"/>"
	},
	"screen-tablet": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M192,24H64A24,24,0,0,0,40,48V208a24,24,0,0,0,24,24H192a24,24,0,0,0,24-24V48A24,24,0,0,0,192,24ZM56,72H200V184H56Zm8-32H192a8,8,0,0,1,8,8v8H56V48A8,8,0,0,1,64,40ZM192,216H64a8,8,0,0,1-8-8v-8H200v8A8,8,0,0,1,192,216Z\"/>"
	},
	"screen-mobile": {
		viewBox: "0 0 256 256",
		attrs: $,
		body: "<path d=\"M176,16H80A24,24,0,0,0,56,40V216a24,24,0,0,0,24,24h96a24,24,0,0,0,24-24V40A24,24,0,0,0,176,16ZM72,64H184V192H72Zm8-32h96a8,8,0,0,1,8,8v8H72V40A8,8,0,0,1,80,32Zm96,192H80a8,8,0,0,1-8-8v-8H184v8A8,8,0,0,1,176,224Z\"/>"
	}
};
//#endregion
//#region apps/docs/src/sandbox/entry.ts
_();
//#endregion
export { ks as destroyMount, cB as initComponents, o as mountIcons, lB as phosphorIcons, s as remountIcons };
