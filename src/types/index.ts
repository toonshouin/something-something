export interface IProfileResp {
	headers: IHeaders;
	intro: IIntro;
	projects: IProject[];
	technologies: ITechnology[];
	workExperiences: IWorkExperience[];
	educations: IEducation[];
	certifications: ICertification[];
	interests: string[];
	positions: IPosition[];
	resumeUrl: {
		sourceLink: string;
		fullVersionLink?: string;
		fullVersion?: string;
	};
}

export interface IPosition {
	name: string;
	description: string;
}

export interface IHeaders {
	coreCompetencies: string;
	workExperience: string;
	projects: string;
	education: string;
	certifications: string;
	interests: string;
	positions: string;
}

export interface IIntro {
	name: string;
	nickname: string;
	phone: string;
	email: string;
	github: string;
	linkedin: string;
	hidePicture?: boolean;
	location: string | {
		house_no?: string;
		moo?: string;
		soi?: string;
		village?: string;
		road?: string;
		sub_district?: string;
		district?: string;
		province?: string;
		country?: string;
		zip_code?: string;
		hidden?: boolean;
	};
	website: string;
	description: string;
}

export interface IProject {
	name: string;
	bullets: string[];
	url: string;
	hide?: boolean;
}

export interface ITechnology {
	section: string;
	details: string;
	hide?: boolean;
}

export interface IWorkExperience {
	position: string;
	company: string;
	url: string;
	years: string[];
	bullets: string[];
	hide?: boolean;
}

export interface IEducation {
	head: string;
	details: string;
	gpa?: string;
	relevantCoursework?: string[];
	hide?: boolean;
}

export interface ICertification {
	name: string;
	date?: string;
	url?: string;
	verificationUrl?: string;
	verificationKind?: string;
	verificationCode?: string;
	validUntil?: string;
	issuer?: string;
	credentialType?: string;
	hide?: boolean;
}
