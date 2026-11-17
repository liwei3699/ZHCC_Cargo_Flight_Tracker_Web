export function createFakeDb(seed = { flight_snapshots: [], flight_sync_state: [] }) {
  const tables = {
    flight_snapshots: [...(seed.flight_snapshots || [])],
    flight_sync_state: [...(seed.flight_sync_state || [])],
  };

  function from(table) {
    if (!(table in tables)) throw new Error("invalid_table");
    const filters = [];
    let mode = "read";
    let values = null;
    let limit = 1;

    const query = {
      select() {
        return query;
      },
      eq(key, value) {
        filters.push([key, value]);
        return query;
      },
      limit(value) {
        limit = value;
        return query;
      },
      insert(value) {
        mode = "insert";
        values = value;
        return query;
      },
      update(value) {
        mode = "update";
        values = value;
        return query;
      },
      then(resolve, reject) {
        return Promise.resolve()
          .then(() => {
            const rows = tables[table].filter((row) =>
              filters.every(([key, value]) => row[key] === value),
            );
            if (mode === "insert") {
              if (tables[table].some((row) => row.id === values.id)) {
                return { data: [], error: { message: "duplicate" } };
              }
              tables[table].push({ ...values });
              return { data: [{ ...values }], error: null };
            }
            if (mode === "update") {
              rows.forEach((row) => Object.assign(row, values));
              return { data: rows.slice(0, limit).map((row) => ({ ...row })), error: null };
            }
            return { data: rows.slice(0, limit).map((row) => ({ ...row })), error: null };
          })
          .then(resolve, reject);
      },
    };
    return query;
  }

  return { tables, from };
}
