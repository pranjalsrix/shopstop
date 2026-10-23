const parseBoolean = (value, defaultValue = false) => {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    return String(value).toLowerCase() === 'true';
};

const parsePositiveInteger = (value, defaultValue) => {
    const parsed = Number(value);

    return Number.isInteger(parsed) && parsed > 0
        ? parsed
        : defaultValue;
};

const demoInventoryConfig = {
    enabled: parseBoolean(process.env.DEMO_INVENTORY_ENABLED, true),

    restockDelaySeconds: parsePositiveInteger(
        process.env.DEMO_RESTOCK_DELAY_SECONDS,
        60
    ),

    get restockDelayMs() {
        return this.restockDelaySeconds * 1000;
    }
};

module.exports = demoInventoryConfig;