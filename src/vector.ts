
export interface Vector2D {
    x: number,
    y: number,
};

export const Vector = {
    
    create(x : number, y : number) : Vector2D {
        // if(x == null || y == null) return null;
        return { x, y };
    },

    
    /**
     * 
     * @param {Vector2D} a 
     * @param {Vector2D} b
     * @returns {number} 
     */
    dot(a : Vector2D, b : Vector2D) : number {
        return a.x * b.x + a.y * b.y;
    },
    
    /**
     * 
     * @param {Vector2D} a 
     * @returns {number}
     */
    mag(a : Vector2D) : number {
        return Math.sqrt(a.x * a.x + a.y * a.y);
    },
    
    /**
     * 
     * @param {Vector2D} a 
     * @param {Vector2D} b
     * @returns {Vector2D} 
     */
    sub(a : Vector2D, b : Vector2D) : Vector2D {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
        };
    },
    
    /**
     * 
     * @param {Vector2D} a 
     * @param {Vector2D} b
     * @returns {Vector2D} 
     */
    add(a : Vector2D, b : Vector2D) : Vector2D {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
        };
    },
    /**
     * 
     * @param {Vector2D} a 
     * @param {number} k 
     * @returns {Vector2D}
     */
    sca(a : Vector2D, k : number) : Vector2D {
        return {
            x: a.x * k,
            y: a.y * k,
        };
    },
    
    /**
     * 
     * @param {Vector2D} v
     * @returns {number} 
     */
    angle(v : Vector2D) : number {
        return Math.atan2(v.x, v.y);
    },

    polar(r : number, theta : number) : Vector2D {
        return {
            x: r * Math.sin(theta),
            y: r * Math.cos(theta)
        };
    },

    norm(v: Vector2D) : Vector2D {
        return Vector.sca(v, 1 / Vector.mag(v));
    }
}