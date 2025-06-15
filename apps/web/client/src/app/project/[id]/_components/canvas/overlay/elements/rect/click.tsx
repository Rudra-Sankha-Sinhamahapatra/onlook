import { adaptValueToCanvas } from '@/components/store/editor/overlay/utils';
import type { DomElementStyles, RectDimensions } from '@onlook/models';
import { colors } from '@onlook/ui/tokens';
import { nanoid } from 'nanoid';
import { BaseRect } from './base';
import { ResizeHandles } from './resize';
import { EditorAttributes } from '@onlook/constants';

const parseCssBoxValues = (
    value: string,
): {
    adjusted: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    original: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
} => {
    const originalValues = value.split(' ').map((v) => parseInt(v));
    const adjustedValues = originalValues.map((v) => Math.round(adaptValueToCanvas(v)));

    let original = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };
    let adjusted = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };

    switch (originalValues.length) {
        case 1:
            original = {
                top: originalValues[0] ?? 0,
                right: originalValues[0] ?? 0,
                bottom: originalValues[0] ?? 0,
                left: originalValues[0] ?? 0,
            };
            adjusted = {
                top: adjustedValues[0] ?? 0,
                right: adjustedValues[0] ?? 0,
                bottom: adjustedValues[0] ?? 0,
                left: adjustedValues[0] ?? 0,
            };
            break;
        case 2:
            original = {
                top: originalValues[0] ?? 0,
                right: originalValues[1] ?? 0,
                bottom: originalValues[0] ?? 0,
                left: originalValues[1] ?? 0,
            };
            adjusted = {
                top: adjustedValues[0] ?? 0,
                right: adjustedValues[1] ?? 0,
                bottom: adjustedValues[0] ?? 0,
                left: adjustedValues[1] ?? 0,
            };
            break;
        case 4:
            original = {
                top: originalValues[0] ?? 0,
                right: originalValues[1] ?? 0,
                bottom: originalValues[2] ?? 0,
                left: originalValues[3] ?? 0,
            };
            adjusted = {
                top: adjustedValues[0] ?? 0,
                right: adjustedValues[1] ?? 0,
                bottom: adjustedValues[2] ?? 0,
                left: adjustedValues[3] ?? 0,
            };
            break;
        default:
            original = { top: 0, right: 0, bottom: 0, left: 0 };
            adjusted = { top: 0, right: 0, bottom: 0, left: 0 };
            break;
    }
    return { adjusted, original };
};

// Helper function to detect auto margin classes
const detectAutoMargins = (domId: string): {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
} => {
    try {
        let element = document.querySelector(`[${EditorAttributes.DATA_ONLOOK_DOM_ID}="${domId}"]`) as HTMLElement;
        
        // Since DOM IDs aren't working, we can't reliably detect auto margins
        // Return false for all auto margins until DOM ID injection is fixed
        if (!element) {
            console.log('🔍 No element found with domId - DOM ID injection not working');
            console.log('⚠️ Auto margin detection disabled until DOM IDs are properly injected');
            return { top: false, right: false, bottom: false, left: false };
        }
        
        if (!element) {
            return { top: false, right: false, bottom: false, left: false };
        }

        const className = element.className || '';
        const classes = className.split(/\s+/);
        
        console.log('📋 Checking element with classes:', classes);
        
        // Check for Tailwind auto margin classes
        const hasMyAuto = classes.includes('my-auto');
        const hasMxAuto = classes.includes('mx-auto');
        const hasMtAuto = classes.includes('mt-auto');
        const hasMrAuto = classes.includes('mr-auto');
        const hasMbAuto = classes.includes('mb-auto');
        const hasMlAuto = classes.includes('ml-auto');
        const hasMaAuto = classes.includes('m-auto');
        
        console.log('🎯 Auto class detection:', {
            hasMyAuto,
            hasMxAuto,
            hasMtAuto,
            hasMrAuto,
            hasMbAuto,
            hasMlAuto,
            hasMaAuto
        });
        
        // Also check for computed style values of 'auto'
        const computedStyle = window.getComputedStyle(element);
        const marginTop = computedStyle.marginTop;
        const marginRight = computedStyle.marginRight;
        const marginBottom = computedStyle.marginBottom;
        const marginLeft = computedStyle.marginLeft;
        
        console.log('💻 Computed margins:', {
            marginTop,
            marginRight,
            marginBottom,
            marginLeft
        });
        
        const result = {
            top: hasMaAuto || hasMyAuto || hasMtAuto || marginTop === 'auto',
            right: hasMaAuto || hasMxAuto || hasMrAuto || marginRight === 'auto',
            bottom: hasMaAuto || hasMyAuto || hasMbAuto || marginBottom === 'auto',
            left: hasMaAuto || hasMxAuto || hasMlAuto || marginLeft === 'auto',
        };
        
        console.log('🏁 Auto margin detection result:', result);
        
        return result;
    } catch (error) {
        return { top: false, right: false, bottom: false, left: false };
    }
};

interface ClickRectProps extends RectDimensions {
    isComponent?: boolean;
    styles: DomElementStyles | null;
    shouldShowResizeHandles: boolean;
    domId?: string;
}

export const ClickRect = ({
    width,
    height,
    top,
    left,
    isComponent,
    styles,
    shouldShowResizeHandles,
    domId,
}: ClickRectProps) => {
    const renderMarginLabels = () => {
        if (!styles?.computed.margin) {
            return null;
        }
        const { adjusted, original } = parseCssBoxValues(styles.computed.margin);
        
        // Detect auto margins
        const autoMargins = domId ? detectAutoMargins(domId) : { top: false, right: false, bottom: false, left: false };

        const patternId = `margin-pattern-${nanoid()}`;
        const maskId = `margin-mask-${nanoid()}`;

        return (
            <>
                <defs>
                    <pattern id={patternId} patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill={colors.blue[500]} fillOpacity="0.1" />
                        <line
                            x1="0"
                            y1="20"
                            x2="20"
                            y2="0"
                            stroke={colors.blue[500]}
                            strokeWidth="0.3"
                            strokeLinecap="square"
                        />
                    </pattern>
                    <mask id={maskId}>
                        <rect
                            x={-adjusted.left}
                            y={-adjusted.top}
                            width={width + adjusted.left + adjusted.right}
                            height={height + adjusted.top + adjusted.bottom}
                            fill="white"
                        />
                        <rect x="0" y="0" width={width} height={height} fill="black" />
                    </mask>
                </defs>
                <rect
                    x={-adjusted.left}
                    y={-adjusted.top}
                    width={width + adjusted.left + adjusted.right}
                    height={height + adjusted.top + adjusted.bottom}
                    fill={`url(#${patternId})`}
                    mask={`url(#${maskId})`}
                />

                {/* Margin labels - show "auto" or numbers based on detection */}
                {(original.top > 0 || autoMargins.top) && (
                    <text
                        x={width / 2}
                        y={-adjusted.top / 2}
                        fill={autoMargins.top ? colors.blue[500] : colors.blue[700]}
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontStyle={autoMargins.top ? 'italic' : 'normal'}
                    >
                        {autoMargins.top ? 'auto' : original.top}
                    </text>
                )}
                {(original.bottom > 0 || autoMargins.bottom) && (
                    <text
                        x={width / 2}
                        y={height + adjusted.bottom / 2}
                        fill={autoMargins.bottom ? colors.blue[500] : colors.blue[700]}
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontStyle={autoMargins.bottom ? 'italic' : 'normal'}
                    >
                        {autoMargins.bottom ? 'auto' : original.bottom}
                    </text>
                )}
                {(original.left > 0 || autoMargins.left) && (
                    <text
                        x={-adjusted.left / 2}
                        y={height / 2}
                        fill={autoMargins.left ? colors.blue[500] : colors.blue[700]}
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontStyle={autoMargins.left ? 'italic' : 'normal'}
                    >
                        {autoMargins.left ? 'auto' : original.left}
                    </text>
                )}
                {(original.right > 0 || autoMargins.right) && (
                    <text
                        x={width + adjusted.right / 2}
                        y={height / 2}
                        fill={autoMargins.right ? colors.blue[500] : colors.blue[700]}
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontStyle={autoMargins.right ? 'italic' : 'normal'}
                    >
                        {autoMargins.right ? 'auto' : original.right}
                    </text>
                )}
            </>
        );
    };

    const renderPaddingLabels = () => {
        if (!styles?.computed.padding) {
            return null;
        }
        const { adjusted, original } = parseCssBoxValues(styles.computed.padding);

        const patternId = `padding-pattern-${nanoid()}`;
        const maskId = `padding-mask-${nanoid()}`;
        const pWidth = width - adjusted.left - adjusted.right;
        const pHeight = height - adjusted.top - adjusted.bottom;

        return (
            <>
                <defs>
                    <pattern id={patternId} patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill={colors.green[500]} fillOpacity="0.1" />
                        <line
                            x1="0"
                            y1="20"
                            x2="20"
                            y2="0"
                            stroke={colors.green[500]}
                            strokeWidth="0.3"
                            strokeLinecap="square"
                        />
                    </pattern>
                    <mask id={maskId}>
                        <rect x="0" y="0" width={width} height={height} fill="white" />
                        <rect
                            x={adjusted.left}
                            y={adjusted.top}
                            width={pWidth}
                            height={pHeight}
                            fill="black"
                        />
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width={width}
                    height={height}
                    fill={`url(#${patternId})`}
                    mask={`url(#${maskId})`}
                />

                {/* Keep existing padding labels */}
                {original.top > 0 && (
                    <text
                        x={width / 2}
                        y={adjusted.top / 2}
                        fill={colors.green[700]}
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {original.top}
                    </text>
                )}
                {original.bottom > 0 && (
                    <text
                        x={width / 2}
                        y={height - adjusted.bottom / 2}
                        fill={colors.green[700]}
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {original.bottom}
                    </text>
                )}
                {original.left > 0 && (
                    <text
                        x={adjusted.left / 2}
                        y={height / 2}
                        fill={colors.green[700]}
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {original.left}
                    </text>
                )}
                {original.right > 0 && (
                    <text
                        x={width - adjusted.right / 2}
                        y={height / 2}
                        fill={colors.green[700]}
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {original.right}
                    </text>
                )}
            </>
        );
    };

    const renderDimensionLabels = () => {
        const rectColor = isComponent ? colors.purple[500] : colors.red[500];
        const displayWidth = parseFloat(styles?.computed.width ?? '0').toFixed(0);
        const displayHeight = parseFloat(styles?.computed.height ?? '0').toFixed(0);
        const text = `${displayWidth} × ${displayHeight}`;

        // Constants from showDimensions
        const padding = { top: 2, bottom: 2, left: 4, right: 4 };
        const radius = 2;

        // Assuming text width is roughly 80px and height is 16px (you may want to measure this dynamically)
        const rectWidth = 80 + padding.left + padding.right;
        const rectHeight = 16 + padding.top + padding.bottom;
        const rectX = (width - rectWidth) / 2;
        const rectY = height;

        // Path for rounded rectangle
        const path =
            rectWidth > width
                ? `M${rectX + radius},${rectY} q-${radius},0 -${radius},${radius} v${rectHeight - 2 * radius} q0,${radius} ${radius},${radius} h${rectWidth - 2 * radius} q${radius},0 ${radius},-${radius} v-${rectHeight - 2 * radius} q0,-${radius} -${radius},-${radius} z`
                : `M${rectX},${rectY} v${rectHeight - radius} q0,${radius} ${radius},${radius} h${rectWidth - 2 * radius} q${radius},0 ${radius},-${radius} v-${rectHeight - radius} z`;

        return (
            <g>
                <path d={path} fill={rectColor} />
                <text
                    x={width / 2}
                    y={rectY + rectHeight / 2}
                    fill="white"
                    fontSize="12"
                    textAnchor="middle"
                    dominantBaseline="middle"
                >
                    {text}
                </text>
            </g>
        );
    };

    return (
        <BaseRect
            width={width}
            height={height}
            top={top}
            left={left}
            isComponent={isComponent}
            strokeWidth={2}
        >
            {renderMarginLabels()}
            {renderPaddingLabels()}
            {shouldShowResizeHandles && (
                <ResizeHandles
                    width={width}
                    height={height}
                    left={left}
                    top={top}
                    borderRadius={parseInt(styles?.computed.borderRadius ?? '0')}
                    isComponent={isComponent}
                    styles={styles?.computed ?? {}}
                />
            )}
        </BaseRect>
    );
};
