import { TreeItem } from './TreeItem.js';
import { FlowerItem } from './FlowerItem.js';
import { FurnitureItem } from './FurnitureItem.js';
import { DecorationItem } from './DecorationItem.js';

export class ItemFactory {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.itemTypes = new Map([
            ['tree', TreeItem],
            ['flower', FlowerItem],
            ['furniture', FurnitureItem],
            ['decoration', DecorationItem]
        ]);
    }

    createItem(type, subType, position) {
        const ItemClass = this.itemTypes.get(type);
        if (!ItemClass) {
            throw new Error(`Unknown item type: ${type}`);
        }

        const item = new ItemClass(this.assetManager, subType);
        item.setPosition(position);
        return item;
    }

    getAvailableTypes() {
        return Array.from(this.itemTypes.keys());
    }

    registerItemType(type, ItemClass) {
        this.itemTypes.set(type, ItemClass);
    }
}