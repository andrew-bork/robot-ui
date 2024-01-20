
export interface ArmState {
    rotunda : number; // Rotunda
    shoulder : number; // Shoulder
    elbow : number; // Elbow
    wristPitch : number; // Wrist Pitch
    wristRoll : number; // Wrist Roll
    effectorPosition: number;
};

export interface EffectorState {
    pitch: number;
    roll: number;
    position: number;
}
