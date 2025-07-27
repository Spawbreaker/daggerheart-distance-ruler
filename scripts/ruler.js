const original_getwaypointLabelContext = foundry.canvas.interaction.Ruler.prototype._getWaypointLabelContext;

const override_getwaypointLabelContext = (waypoint, state) => {
  const { index, elevation, previous, ray } = waypoint;
  state.hasElevation ||= elevation !== 0;
  if (!previous) return;
  const deltaElevation = elevation - previous.elevation;
  if (ray.distance === 0 && deltaElevation === 0) return;

  // Prepare data structure
  const context = {
    action: { icon: "fa-solid fa-ruler" },
    cssClass: [
      this.hidden ? "secret" : "",
      waypoint.next ? "" : "last",
    ].filterJoin(" "),
    secret: this.hidden,
    units: canvas.grid.units,
    uiScale: canvas.dimensions.uiScale,
    position: { x: ray.B.x, y: ray.B.y - 16 * canvas.dimensions.uiScale },
    daggerheart: {},
  };

  // Segment Distance
  context.distance = {
    total: waypoint.measurement.distance
      .toNearest(0.01)
      .toLocaleString(game.i18n.lang),
  };
  if (index >= 2)
    context.distance.delta = waypoint.measurement.backward.distance
      .toNearest(0.01)
      .signedString();

  // Elevation
  context.elevation = {
    total: elevation,
    icon: "fa-solid fa-arrows-up-down",
    hidden: !state.hasElevation,
  };
  if (deltaElevation !== 0)
    context.elevation.delta = deltaElevation.signedString();

  if (context.distance.total <= 1) {
    context.daggerheart.melee = true;
  } else if (context.distance.total <= 3) {
    context.daggerheart.veryClose = true;
  } else if (context.distance.total <= 6) {
    context.daggerheart.close = true;
  } else if (context.distance.total <= 12) {
    context.daggerheart.far = true;
  } else {
    context.daggerheart.veryFar = true;
  }

  return context;
};

Hooks.once("ready", () => {
  console.log("DDR | Initializing");

  foundry.canvas.interaction.Ruler.WAYPOINT_LABEL_TEMPLATE =
    "/modules/daggerheart-distance-ruler/templates/ruler.hbs";
  foundry.canvas.placeables.tokens.TokenRuler.WAYPOINT_LABEL_TEMPLATE =
    "/modules/daggerheart-distance-ruler/templates/ruler.hbs";

  console.log("DDR | Registering Ruler._getWaypointLabelContext override");
  libWrapper.register(
    "daggerheart-distance-ruler",
    "foundry.canvas.interaction.Ruler.prototype._getWaypointLabelContext",
    override_getwaypointLabelContext,
    "OVERRIDE"
  );
  libWrapper.register(
    "daggerheart-distance-ruler",
    "foundry.canvas.placeables.tokens.TokenRuler.prototype._getWaypointLabelContext",
    override_getwaypointLabelContext,
    "OVERRIDE"
  );
});
