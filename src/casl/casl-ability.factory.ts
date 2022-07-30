import { Injectable } from '@nestjs/common';
import { User, Prisma, Group, File, Invite, Role } from '@prisma/client';
import { AbilityClass, AbilityBuilder } from '@casl/ability';
import { PrismaAbility, Subjects } from '@casl/prisma';
import { Action } from './actions.enum';

type AppAbility = PrismaAbility<
  [
    Action,
    (
      | Subjects<{
          User: User;
          Group: Group;
          File: File;
          Invite: Invite;
        }>
      | 'all'
    ),
  ]
>;
const AppAbility = PrismaAbility as AbilityClass<AppAbility>;
@Injectable()
export class CaslAbilityFactory {
  defineAbility(user: { id: string; role: Role }) {
    const { can, cannot, build } = new AbilityBuilder(AppAbility);

    if (user.role === Role.USER) {
      // can(Action.Create, Prisma.ModelName.Group);
      // can(Action.Create, Prisma.ModelName.User);
      // can(Action.Create, Prisma.ModelName.Invite, { userId: user.id });
      // can(Action.Read, Prisma.ModelName.User);
      can(Action.Read, Prisma.ModelName.User, { id: user.id });
      can(Action.Create, Prisma.ModelName.File, {});
      // can(Action.Delete, Prisma.ModelName.Group);
    } else if (user.role === Role.ADMIN) {
      can(Action.Manage, 'all');
    } else {
      cannot(Action.Manage, 'all');
    }

    return build();
  }
}
