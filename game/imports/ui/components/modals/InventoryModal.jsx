import React from "react";

import {
  Meteor,
} from "meteor/meteor";

import {
  useTracker,
} from "meteor/react-meteor-data";

import {
  Characters,
} from "../../../api/characters/characters";

import {
  ITEM_NAMES,
  splitMoney,
  stackItems,
} from "../../../game/inventory";

import {
  HudModal,
} from "../HudModal";

import { Icon } from "../Icon";


const INVENTORY_SLOTS =
  20;

const ITEM_DISPLAY = {
  boar_skin: {
    icon: "boarSkin",
    iconClass: "h-7 w-7 text-amber-800",
  },
  wolf_skin: {
    icon: "wolfSkin",
    iconClass: "h-7 w-7 text-blue-600",
  },
};


const MoneyDisplay = ({
  money,
}) => {
  const currencies = [
    {
      value:
        money.gold,

      label:
        "Gold",

      color:
        "bg-yellow-400",

      text:
        "text-yellow-600",
    },

    {
      value:
        money.silver,

      label:
        "Silver",

      color:
        "bg-slate-300",

      text:
        "text-slate-600",
    },

    {
      value:
        money.bronze,

      label:
        "Bronze",

      color:
        "bg-orange-700",

      text:
        "text-orange-700",
    },
  ];


  return (
    <div
      className="
        flex
        min-w-0
        flex-wrap
        items-center
        justify-end
        gap-x-3
        gap-y-2

        rounded-md

        border
        border-gray-200

        bg-gray-50

        px-3
        py-2
      "
    >
      {currencies.map(
        (
          currency
        ) => (
          <div
            key={
              currency.label
            }
            title={
              currency.label
            }
            className={[
              "flex items-center gap-1 text-sm font-bold",
              currency.text,
            ].join(
              " "
            )}
          >
            <span>
              {
                currency.value
              }
            </span>

            <span
              className={[
                "h-3 w-3 shrink-0 rounded-full shadow",
                currency.color,
              ].join(
                " "
              )}
            />
          </div>
        )
      )}
    </div>
  );
};


const InventorySlot = ({
  item,
}) => {
  if (
    !item
  ) {
    return (
      <div
        className="
          aspect-square
          min-w-0

          rounded-md

          border
          border-gray-300

          bg-white

          shadow-inner

          transition

          hover:border-gray-400
          hover:bg-gray-50
        "
      />
    );
  }


  const name =
    ITEM_NAMES[
      item.id
    ] ||
    item.id;

  const rarityClass = item.id === "wolf_skin" ? "border-blue-400 hover:border-blue-500" : "border-slate-300 hover:border-slate-400";
  const itemDisplay = ITEM_DISPLAY[item.id];


  return (
    <div
      className="tooltip tooltip-top block aspect-square min-w-0"
      data-tip={name}
    >
      <div
        className={[
          "group relative aspect-square min-w-0 cursor-default overflow-hidden rounded-md border bg-gradient-to-br from-amber-50 to-gray-100 shadow-sm transition hover:brightness-105",
          rarityClass,
        ].join(" ")}
      >
        <div
          className="
            absolute
            inset-1

            flex
            items-center
            justify-center

            overflow-hidden

            rounded

            border
            border-gray-200

            bg-white

            p-1
          "
        >
          <Icon
            icon={itemDisplay?.icon}
            className={itemDisplay?.iconClass}
            aria-label={name}
          />
        </div>


        {item.count >
          1 && (
          <span
            className="
              absolute
              bottom-1
              right-1

              rounded

              bg-gray-900

              px-1

              text-xs
              font-bold

              text-white

              shadow
            "
          >
            {item.count}
          </span>
        )}
      </div>
    </div>
  );
};


export const InventoryModal =
  () => {
    const {
      money,
      items,
    } =
      useTracker(
        () => {
          const user =
            Meteor.user();


          const currentCharacterId =
            user
              ?.profile
              ?.currentCharacterId;


          const character =
            currentCharacterId
              ? Characters.findOne(
                  currentCharacterId
                )
              : null;


          return {
            money:
              splitMoney(
                user
                  ?.profile
                  ?.inventory
                  ?.money
              ),

            items:
              stackItems(
                character
                  ?.inventory
                  ?.items
              ),
          };
        }
      );


    const slots =
      Array.from(
        {
          length:
            INVENTORY_SLOTS,
        },

        (
          _,
          index
        ) =>
          items[
            index
          ] ||
          null
      );


    return (
      <HudModal
        id="inventory"
        title="Inventory"
      >
        <div
          className="
            w-full
            min-w-0
            max-w-full

            overflow-hidden

            rounded-xl

            border
            border-gray-200

            bg-white

            p-4

            text-gray-900

            shadow-2xl
          "
        >
          {/*
           * =====================================================
           * HEADER
           * =====================================================
           */}

          <div
            className="
              mb-4

              flex
              min-w-0
              items-start
              justify-between
              gap-3
            "
          >
            <div className="min-w-0">
              <h3
                className="
                  truncate

                  text-sm
                  font-bold

                  uppercase
                  tracking-[0.18em]

                  text-gray-900
                "
              >
                Backpack
              </h3>

              <p
                className="
                  mt-1

                  text-xs

                  text-gray-500
                "
              >
                {
                  items.length
                }
                {" "}
                /{" "}
                {
                  INVENTORY_SLOTS
                }
                {" "}
                slots used
              </p>
            </div>


            <div
              className="
                shrink-0

                rounded-md

                border
                border-gray-200

                bg-gray-100

                px-3
                py-1.5

                text-xs
                font-semibold

                text-gray-600
              "
            >
              Bag 1
            </div>
          </div>


          {/*
           * =====================================================
           * INVENTORY GRID
           * =====================================================
           */}

          <div
            className="
              grid
              w-full
              min-w-0
              grid-cols-5
              gap-2

              rounded-lg

              border
              border-gray-200

              bg-gray-50

              p-3
            "
          >
            {slots.map(
              (
                item,
                index
              ) => (
                <InventorySlot
                  key={
                    item
                      ? `${item.id}-${index}`
                      : `empty-${index}`
                  }
                  item={
                    item
                  }
                />
              )
            )}
          </div>


          {/*
           * =====================================================
           * EMPTY STATE
           * =====================================================
           */}

          {!items.length && (
            <div
              className="
                py-3

                text-center

                text-xs

                text-gray-500
              "
            >
              Your inventory is empty.
            </div>
          )}


          {/*
           * =====================================================
           * MONEY
           * =====================================================
           */}

          <div className="mt-3">
            <MoneyDisplay
              money={
                money
              }
            />
          </div>
        </div>
      </HudModal>
    );
  };
