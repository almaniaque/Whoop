
import { Context } from 'chartjs-plugin-datalabels/types/context';

declare module 'chart.js' {
    interface PluginOptionsByType<TType extends ChartType> {
        datalabels: {
            display?: boolean;
            color?: string;
            font?: { weight?: string; size?: number };
            formatter?: (value: number, context: Context) => string | number;
        };
    }
}