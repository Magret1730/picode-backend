import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateLessonDto {
  @IsUUID()
  levelId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(128)
  slug!: string;

  @IsString()
  goal!: string;

  @IsString()
  explanation!: string;

  @IsOptional()
  @IsString()
  exampleCode?: string;

  @IsInt()
  @Min(1)
  orderIndex!: number;
}

export class UpdateLessonDto {
  @IsOptional()
  @IsUUID()
  levelId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  slug?: string;

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsString()
  exampleCode?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  orderIndex?: number;
}

