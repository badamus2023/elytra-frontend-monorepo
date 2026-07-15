import { useState, type FormEvent } from "react";
import type { DroneResponse } from '@drones/shared/api/model'
import {
  useCreateDrone,
  useDeleteDrone,
  useUpdateDrone,
} from '@drones/shared/integrations/orval/mutations'
import { useDrones } from '@drones/shared/integrations/orval/queries'
import { ConfirmDialog } from '@drones/shared/components/ConfirmDialog/ConfirmDialog'
import { FormModal } from '@drones/shared/components/FormModal/FormModal'
import { DataTable } from '@drones/shared/components/Table/DataTable'
import { StatusBadge } from '@drones/shared/ui/StatusBadge'

export function DronesManagementPage() {
  const { data, isLoading } = useDrones();
  const drones = data ?? [];
  const createDrone = useCreateDrone();
  const updateDrone = useUpdateDrone();
  const deleteDrone = useDeleteDrone();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DroneResponse | null>(null);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>("");
  const formFieldsKey = `${editing?.id ?? "new"}-${formOpen}`;

  const openCreate = () => {
    setEditing(null);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (drone: DroneResponse) => {
    setEditing(drone);
    setFormError("");
    setFormOpen(true);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const maxPayloadKg = Number(formData.get("maxPayloadKg") ?? 0);
    const homeLatitude = Number(formData.get("homeLatitude") ?? 0);
    const homeLongitude = Number(formData.get("homeLongitude") ?? 0);
    const batteryLevel = formData.get("batteryLevel");
    const battery =
      batteryLevel != null && String(batteryLevel).trim() !== ""
        ? Number(batteryLevel)
        : undefined;

    if (!name) {
      setFormError("Name is required.");
      return;
    }
    if (!Number.isFinite(maxPayloadKg) || maxPayloadKg <= 0) {
      setFormError("Max payload must be a positive number.");
      return;
    }

    try {
      if (editing?.id) {
        if (battery == null || !Number.isFinite(battery)) {
          setFormError("Battery level is required for updates.");
          return;
        }
        await updateDrone.mutateAsync({
          droneId: editing.id,
          body: {
            name,
            maxPayloadKg,
            batteryLevel: battery,
          },
        });
      } else {
        if (!Number.isFinite(homeLatitude) || !Number.isFinite(homeLongitude)) {
          setFormError("Home latitude and longitude are required.");
          return;
        }
        await createDrone.mutateAsync({
          name,
          maxPayloadKg,
          homeLatitude,
          homeLongitude,
        });
      }
      setFormOpen(false);
      setFormError("");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Request failed. Please retry.",
      );
    }
  };

  return (
    <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">
          Drones Management
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-md border border-cyan-300/40 bg-cyan-500/20 px-3 py-1.5 text-xs text-cyan-100"
        >
          Add drone
        </button>
      </div>
      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading drones...</p>
      ) : (
        <DataTable
          data={drones}
          emptyLabel="No drones found."
          columns={[
            {
              key: "name",
              header: "Name",
              render: (drone) => drone.name ?? "N/A",
            },
            {
              key: "status",
              header: "Status",
              render: (drone) => <StatusBadge value={drone.status} />,
            },
            {
              key: "battery",
              header: "Battery",
              render: (drone) => `${drone.batteryLevel ?? 0}%`,
            },
            {
              key: "payload",
              header: "Max kg",
              render: (drone) => drone.maxPayloadKg ?? 0,
            },
            {
              key: "actions",
              header: "Actions",
              render: (drone) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(drone)}
                    className="rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDeleteId(drone.id ?? null)}
                    className="rounded-md border border-red-300/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <FormModal
        isOpen={formOpen}
        title={editing ? "Edit drone" : "Add drone"}
        submitLabel={editing ? "Save changes" : "Create drone"}
        loading={createDrone.isPending || updateDrone.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={onSubmit}
      >
        <label className="block text-sm text-zinc-300">
          Name
          <input
            name="name"
            defaultValue={editing?.name ?? ""}
            className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Max payload (kg)
          <input
            name="maxPayloadKg"
            type="number"
            step="0.1"
            defaultValue={editing?.maxPayloadKg ?? 5}
            className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
        {editing ? (
          <label className="block text-sm text-zinc-300">
            Battery level (%)
            <input
              key={`battery-${formFieldsKey}`}
              name="batteryLevel"
              type="number"
              min={0}
              max={100}
              defaultValue={editing.batteryLevel}
              className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
        ) : (
          <>
            <label className="block text-sm text-zinc-300">
              Home latitude
              <input
                name="homeLatitude"
                type="number"
                step="any"
                defaultValue={52.23}
                className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
              />
            </label>
            <label className="block text-sm text-zinc-300">
              Home longitude
              <input
                name="homeLongitude"
                type="number"
                step="any"
                defaultValue={21.01}
                className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
              />
            </label>
          </>
        )}
        {!editing ? (
          <p className="text-xs text-zinc-500">
            Home coordinates seed the drone&apos;s initial position on the map.
          </p>
        ) : null}
        {formError ? <p className="text-xs text-red-300">{formError}</p> : null}
      </FormModal>

      <ConfirmDialog
        isOpen={toDeleteId !== null}
        title="Delete drone"
        description="Are you sure you want to remove this drone?"
        loading={deleteDrone.isPending}
        onCancel={() => setToDeleteId(null)}
        onConfirm={async () => {
          if (!toDeleteId) return;
          await deleteDrone.mutateAsync(toDeleteId);
          setToDeleteId(null);
        }}
      />
    </section>
  );
}
