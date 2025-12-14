// Global type declarations

declare global {
    interface Window {
        google: typeof google;
    }
}

declare namespace google {
    namespace maps {
        class Map {
            constructor(element: HTMLElement, options: MapOptions);
        }

        class Marker {
            constructor(options: MarkerOptions);
        }

        interface MapOptions {
            center: LatLngLiteral;
            zoom: number;
            styles?: MapTypeStyle[];
            disableDefaultUI?: boolean;
            zoomControl?: boolean;
        }

        interface MarkerOptions {
            position: LatLngLiteral;
            map: Map;
            icon?: Symbol | string;
            title?: string;
        }

        interface LatLngLiteral {
            lat: number;
            lng: number;
        }

        interface Symbol {
            path: SymbolPath | string;
            scale: number;
            fillColor: string;
            fillOpacity: number;
            strokeColor: string;
            strokeWeight: number;
        }

        enum SymbolPath {
            CIRCLE = 0,
            FORWARD_CLOSED_ARROW = 1,
            FORWARD_OPEN_ARROW = 2,
            BACKWARD_CLOSED_ARROW = 3,
            BACKWARD_OPEN_ARROW = 4,
        }

        interface MapTypeStyle {
            featureType?: string;
            elementType?: string;
            stylers?: { [key: string]: string | number }[];
        }
    }
}

export { };
