export  type SignupPayload = {
  email: string;
  name: string;
  password: string;
  re_password: string;
  phone: string | null;
  profile_picture: string | null;
};

export type SignupResponse = {
  user_id: number;
  email: string;
  name: string;
  phone: string | null;
  profile_picture: string | null;
  status?: boolean;
};

export type VerifyOtpResponse = {
   isVerified : boolean
};

export type VerifyOtpPayload = {
  email : string;
  otp : string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access: string;
  refresh: string;
};

export type ActivationPayload = {
  uid: string;
  token: string;
};

export type ActivationResponse = {
  success: boolean;
};

export type ErrorResponse = {
  detail: string;
} | Record<string, string[]>;




export type Collection = {
    name : string ,
    color : string,
    slug: string | null,
}

export type Collections = {
    id : number ,
    name : string ,
    color : string,
    slug: string | null,
}

export type Mood = {
    name: string | null,
    color : string | null,
    emoji : string | null,
}

export type Moods = {
    id : number,
    name: string | null,
    color : string | null,
    emoji : string | null,
}

export type Entry = {
    title: string | null;
    content : string | null;
    is_archived : boolean | null;
    is_favourite : boolean | null;
    collection : number[] | string;
    mood : number | string;
    chapter : number | string
}

export type Chapter = {
   color: string | null;
   title : string | null;
   description : string | null;
   collection : number[] | string;
   is_archived : boolean | null;
   is_favourite : boolean | null;

}
